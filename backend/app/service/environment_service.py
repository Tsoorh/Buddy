import httpx
from datetime import datetime, timezone
from sqlalchemy import insert
from app.base import EnvironmentalCondition
from app.service.db_service import DbService
from app.core.logger import setup_logger
import uuid

logger = setup_logger("environment_logger")


class EnvironmentService:

    @staticmethod
    async def fetch_and_save_conditions(
        session_id: uuid.UUID,
        latitude: float,
        longitude: float,
        entry_time: datetime = None,
    ):
        if not latitude or not longitude:
            return

        # Use current UTC time if no entry_time is provided
        if not entry_time:
            entry_time = datetime.now(timezone.utc)

        # Ensure entry_time is timezone-aware
        if entry_time.tzinfo is None:
            entry_time = entry_time.replace(tzinfo=timezone.utc)

        # Open-Meteo expects time in YYYY-MM-DDTHH:00 format to easily find the hourly index
        time_str = entry_time.strftime("%Y-%m-%dT%H:00")
        date_str = entry_time.strftime("%Y-%m-%d")

        # Determine if we need historical or forecast API (cutoff is usually ~2 days ago)
        is_historical = (datetime.now(timezone.utc) - entry_time).days > 2
        weather_url = (
            "https://archive-api.open-meteo.com/v1/archive"
            if is_historical
            else "https://api.open-meteo.com/v1/forecast"
        )
        marine_url = "https://marine-api.open-meteo.com/v1/marine"

        try:
            async with httpx.AsyncClient() as client:
                # 1. Fetch Weather Data
                weather_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "temperature_2m,surface_pressure,cloudcover,windspeed_10m,winddirection_10m,weathercode",
                    "timezone": "auto",
                    "start_date": date_str,
                    "end_date": date_str,
                }
                weather_res = await client.get(weather_url, params=weather_params)
                weather_data = weather_res.json()
                if "error" in weather_data:
                    logger.error(f"Weather API Error: {weather_data.get('reason')}")

                # 2. Fetch Marine Data (Waves & Currents)
                marine_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "wave_height,wave_direction,ocean_current_velocity,ocean_current_direction",
                    "timezone": "auto",
                    "cell_selection": "sea",
                    "start_date": date_str,
                    "end_date": date_str,
                }
                marine_res = await client.get(marine_url, params=marine_params)
                marine_data = marine_res.json()
                if "error" in marine_data:
                    logger.error(f"Marine API Error: {marine_data.get('reason')}")

                # 3. Fetch Tide & Water Temp Data
                extra_marine_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "sea_level_height_msl,sea_surface_temperature",
                    "timezone": "auto",
                    "cell_selection": "sea",
                    "start_date": date_str,
                    "end_date": date_str,
                }
                extra_marine_res = await client.get(marine_url, params=extra_marine_params)
                extra_marine_data = extra_marine_res.json()
                if "error" in extra_marine_data:
                    logger.error(f"Extra Marine API Error: {extra_marine_data.get('reason')}")

            # Extract closest hour data
            hourly_times = weather_data.get("hourly", {}).get("time", [])
            if time_str not in hourly_times:
                logger.warning(f"time_str {time_str} not found in weather hourly_times. Available: {hourly_times[:5]}...")
            time_index = hourly_times.index(time_str) if time_str in hourly_times else 0

            def get_val(data, section, key, idx=time_index):
                try:
                    return data.get(section, {}).get(key, [])[idx]
                except (IndexError, TypeError, AttributeError):
                    return None

            # Moon phase calculation (0.0 to 1.0)
            # Reference: 2024-01-11 11:57 UTC was a New Moon
            ref_new_moon = datetime(2024, 1, 11, 11, 57, tzinfo=timezone.utc)
            lunar_cycle = 29.530588853
            diff = (entry_time - ref_new_moon).total_seconds() / (24 * 3600)
            moon_phase = (diff % lunar_cycle) / lunar_cycle

            # Tide trend analysis
            tide_heights = extra_marine_data.get("hourly", {}).get("sea_level_height_msl", [])
            current_tide = get_val(extra_marine_data, "hourly", "sea_level_height_msl")
            
            tide_status = None
            tide_type = None
            
            if tide_heights and current_tide is not None:
                # 1. Determine Status (Rising vs Falling)
                prev_index = max(0, time_index - 1)
                prev_tide = tide_heights[prev_index] if len(tide_heights) > prev_index else None
                
                if prev_tide is not None:
                    if current_tide > prev_tide + 0.005: # 5mm threshold to avoid jitter
                        tide_status = "Rising"
                    elif current_tide < prev_tide - 0.005:
                        tide_status = "Falling"
                    else:
                        tide_status = "Slack"
                
                # 2. Determine Type (High vs Low vs Normal)
                max_tide = max(tide_heights)
                min_tide = min(tide_heights)
                
                # If we are within 5cm of the daily extreme, we consider it High/Low tide
                if abs(current_tide - max_tide) < 0.05:
                    tide_type = "High"
                elif abs(current_tide - min_tide) < 0.05:
                    tide_type = "Low"
                else:
                    tide_type = "Normal"

            conditions = {
                "session_id": session_id,
                "weather_status": str(get_val(weather_data, "hourly", "weathercode")),
                "air_temperature": get_val(weather_data, "hourly", "temperature_2m"),
                "atmospheric_pressure": get_val(
                    weather_data, "hourly", "surface_pressure"
                ),
                "cloud_cover": get_val(weather_data, "hourly", "cloudcover"),
                "wind_speed": get_val(weather_data, "hourly", "windspeed_10m"),
                "wind_direction": get_val(weather_data, "hourly", "winddirection_10m"),
                "moon_phase": f"{moon_phase:.2f}",
                "wave_height": get_val(marine_data, "hourly", "wave_height"),
                "wave_direction": get_val(marine_data, "hourly", "wave_direction"),
                "current_speed": get_val(marine_data, "hourly", "ocean_current_velocity"),
                "current_direction": get_val(
                    marine_data, "hourly", "ocean_current_direction"
                ),
                "tide_height": current_tide,
                "tide_status": tide_status,
                "tide_type": tide_type,
                "water_temperature": get_val(
                    extra_marine_data, "hourly", "sea_surface_temperature"
                ),
            }

            # Isolate background DB Session execution
            async for db in DbService.get_db():
                query = insert(EnvironmentalCondition).values(**conditions)
                await db.execute(query)
                await db.commit()
                break  # only execute once

        except Exception as e:
            logger.error(
                f"Failed to fetch environmental conditions for session {session_id}: {e}"
            )
