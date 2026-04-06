# Plan: Environmental Data Tracking & Personalized Fishing Insights

## Goal
Track weather, moon phase, water temperature, atmospheric pressure, and other environmental conditions for every session/catch using an external API. Use this data to provide completely isolated, personalized fishing advice and predictive notifications based on each user's unique success patterns.

## Status
Ready for Implementation

## Implementation Steps

- [ ] **1. Database Models (`app/base.py`)**: 
    - Create an `EnvironmentalCondition` table.
    - **Fields**: `id`, `session_id` (ForeignKey, unique=True), `weather_status`, `air_temperature`, `water_temperature`, `atmospheric_pressure`, `moon_phase`, `wind_speed`, `wind_direction`, `current_direction`, `current_speed`, `wave_height`, `wave_direction`,`tide_status`, `tide_height`, `tide_type`, `cloud_cover`.
    - Generate an Alembic migration script to add this table.

- [ ] **2. External API Integration (`app/service/environment_service.py`)**: 
    - Create a dedicated service to interact with the **Open-Meteo API** (Free, no API key required).
    - Implement a method `get_session_conditions(latitude, longitude, start_time, end_time)` that fetches average/total conditions for the session duration.
    - Open-Meteo endpoints to use: Weather Forecast, Marine Forecast (waves), and Elevation/Tide APIs.

- [ ] **3. Data Collection Pipeline**: 
    - Modify the Session creation flow (`app/api/session/service.py`).
    - When a user logs a session with location data, use FastAPI `BackgroundTasks`.
    - The background task will call `environment_service.get_session_conditions` and save the result to the `EnvironmentalCondition` table asynchronously, keeping the user's API response extremely fast.

## Decisions Made
1. **API Provider**: **Open-Meteo**. It covers air temp, pressure, clouds, wind, wave height/direction, moon phase, and tides—all for free without an API key.
2. **Attachment Level**: Environmental data will be attached **per Session** (averaging the conditions for the duration of the session), not per individual catch.
3. **Performance**: External API calls will be offloaded using FastAPI `BackgroundTasks`.
4. **Analytics**: Hardcoded analytics have been moved to a new AI-based plan (Plan 016).
