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

        # Open-Meteo expects time in YYYY-MM-DDTHH:00 format to easily find the hourly index
        time_str = entry_time.strftime("%Y-%m-%dT%H:00")
        date_str = entry_time.strftime("%Y-%m-%d")

        try:
            weather_url = "https://api.open-meteo.com/v1/forecast"
            marine_url = "https://marine-api.open-meteo.com/v1/marine"

            async with httpx.AsyncClient() as client:
                # 1. Fetch Weather Data
                weather_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "temperature_2m,surface_pressure,cloudcover,windspeed_10m,winddirection_10m",
                    "start_date": date_str,
                    "end_date": date_str,
                }
                weather_res = await client.get(weather_url, params=weather_params)
                weather_data = weather_res.json()

                # 2. Fetch Marine Data
                marine_params = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "wave_height,wave_direction,ocean_current_velocity,ocean_current_direction",
                    "start_date": date_str,
                    "end_date": date_str,
                }
                marine_res = await client.get(marine_url, params=marine_params)
                marine_data = marine_res.json()

            # Extract closest hour data
            hourly_times = weather_data.get("hourly", {}).get("time", [])
            time_index = hourly_times.index(time_str) if time_str in hourly_times else 0

            def get_val(data, key, idx=time_index):
                try:
                    return data.get("hourly", {}).get(key, [])[idx]
                except (IndexError, TypeError, AttributeError):
                    return None

            conditions = {
                "session_id": session_id,
                "air_temperature": get_val(weather_data, "temperature_2m"),
                "atmospheric_pressure": get_val(weather_data, "surface_pressure"),
                "cloud_cover": get_val(weather_data, "cloudcover"),
                "wind_speed": get_val(weather_data, "windspeed_10m"),
                "wind_direction": get_val(weather_data, "winddirection_10m"),
                "wave_height": get_val(marine_data, "wave_height"),
                "wave_direction": get_val(marine_data, "wave_direction"),
                "current_speed": get_val(marine_data, "ocean_current_velocity"),
                "current_direction": get_val(marine_data, "ocean_current_direction"),
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
