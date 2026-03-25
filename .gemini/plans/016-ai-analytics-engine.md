# Plan: AI-Powered Personalized Fishing Analytics Engine

## Goal
Replace hardcoded, rule-based environmental analytics with an AI-driven approach. Feed a user's isolated session, catch, and environmental data to a Large Language Model (LLM) to generate highly personalized fishing insights, ideal condition summaries, and predictive suggestions.

## Status
Pending Approval

## Implementation Steps

- [ ] **1. AI Service Integration (`app/service/ai_service.py`)**: 
    - Create an AI service wrapper.
    - Choose a provider (e.g., Google Gemini API, OpenAI, or a local open-source model). - suggest free provider.
    - Implement a method `generate_fishing_insights(user_data_json: str)`.

- [ ] **2. Data Aggregation & Isolation (`app/api/analytics/service.py`)**: 
    - Create a service to aggregate a specific user's data.
    - **Strict Isolation**: Use the `current_user.id` to fetch ONLY their `Session`, `Catch`, and related `EnvironmentalCondition` data.
    - Format this data into a minimized, token-efficient JSON string or structured prompt (e.g., "Session 1: 5 catches. Moon: Full. Pressure: 1015. Session 2: 0 catches. Moon: New. Pressure: 1008.").

- [ ] **3. Prompt Engineering**:
    - Design a strict system prompt for the AI: 
      *"You are an expert fishing analyst. Analyze the following user data. Identify patterns in weather, moon phases, and tides that correlate with high catch rates or large fish. Respond in JSON format with two keys: `insights` (an array of short string advice) and `optimal_conditions` (a description of the best time for this user to fish)."*

- [ ] **4. Caching Mechanism**:
    - AI API calls cost money/time. We should not calculate this on every request.
    - Create a `UserInsights` table (or cache in memory/Redis) that saves the AI response.
    - Update the insights only when the user logs a *new* session (using a background task) or once a week.

- [ ] **5. API Endpoints (`app/api/analytics/routes.py`)**: 
    - `GET /api/analytics/insights`: Returns the cached AI-generated insights for the `current_user`.

## Questions
1. **AI Provider**: Which LLM provider would you like to use? If you want to keep it free/accessible, Google's Gemini API has a generous free tier. Alternatively, OpenAI (ChatGPT) is standard but requires a paid API key.I WANT A FREE PROVIDER : I GUESS use google gemini api.
2. **Caching**: Do you prefer saving the AI insights in a new database table (e.g., `UserInsights`), or just attaching a JSON column to the existing `User` table to keep it simple?ANS : what is the best practice? 
3. **Triggering**: Should we re-calculate the AI insights automatically in the background every time a user finishes a new session, or only when they explicitly click a "Generate Insights" button on the UI? when a user is loading the homepage the insights will be there (scrolling).