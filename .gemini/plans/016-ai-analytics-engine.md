# Plan: AI-Powered Personal Fishing Data Analyst

## Goal
Transform the user's raw fishing history into actionable, data-driven insights. By feeding a Large Language Model (LLM) the correlation between a user's catches and the environmental conditions we've tracked (tides, moon phases, temperature, pressure), the AI will generate personalized conclusions about their unique success patterns.

## Status
Approved (Refined with Data Correlation focus)

## Implementation Steps

- [ ] **1. Database Models (`app/base.py`)**: 
    - Create a `UserInsight` table to cache the AI's analysis.
    - **Fields**: `id`, `user_id` (ForeignKey), `insights` (JSON list of conclusions), `optimal_conditions` (String), `generated_at` (DateTime).
    - Generate an Alembic migration script.

- [ ] **2. Data Aggregation Service (`app/api/analytics/service.py`)**: 
    - Implement a complex query that joins `Session`, `Catch`, and `EnvironmentalCondition` for the `current_user`.
    - Format this into a "Success Matrix" for the AI. 
    - **Example Data Structure**:
      ```json
      [
        {"date": "2024-03-25", "catches": 5, "tide": "Rising", "moon": "0.23", "temp": 18.4, "pressure": 998},
        {"date": "2024-03-10", "catches": 0, "tide": "Falling", "moon": "0.75", "temp": 16.2, "pressure": 1012}
      ]
      ```

- [ ] **3. AI Analytical Engine (`app/service/ai_service.py`)**: 
    - Integrate **Google Gemini API** (Free Tier).
    - **Prompt Engineering**: 
      *"You are a Data Analyst for a professional fisherman. Analyze the provided success matrix. Your goal is to find mathematical correlations between environmental factors and catch success. Provide conclusions like 'You caught 67% more fish on rising tides' or 'Your biggest catches correlate with atmospheric pressure below 1005hPa'. Do not give generic advice; only speak about the user's specific data."*

- [ ] **4. Background Processing Pipeline**:
    - Modify the `add_session` background task in `app/api/session/service.py`.
    - After `fetch_and_save_conditions` completes, trigger the AI analysis to refresh the `UserInsight` table.
    - This ensures the homepage "Insight Scroll" is always ready and up-to-date.

- [ ] **5. API Endpoints (`app/api/analytics/routes.py`)**: 
    - `GET /api/analytics/insights`: Returns the latest cached record from the `UserInsight` table for the authenticated user.

## Decisions Made
1. **AI Provider**: **Google Gemini 1.5 Flash** (High speed, generous free tier).
2. **Persistence**: Dedicated `UserInsight` table for history and performance.
3. **Trigger**: Automatic background update after every new session.
4. **Focus**: Hard stats and correlations (Tides, Moon, Temperature, Pressure vs. Catch Count/Weight).
