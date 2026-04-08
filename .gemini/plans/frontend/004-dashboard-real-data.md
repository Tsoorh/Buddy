# Plan 004: Dashboard Real Data Integration

This plan outlines the steps to connect the frontend Dashboard to the real backend APIs for AI insights and user catch data, replacing the current mock data and ensuring correct relationships.

## 1. API Service Layer Additions
- [ ] Create `frontend/src/services/CatchService.ts`:
    - Add `getCatchesApi()`: Calls `GET /api/catch/`. 
    - **Note:** Ensure the backend `CatchResponse` includes the nested fish details. If not, this service must handle fetching fish names from `/api/fish/` by `fish_id`.
- [ ] Create `frontend/src/services/AnalyticsService.ts`:
    - Add `getInsightsApi()`: Calls `GET /api/analytics/insights`. Returns AI-generated insights and optimal conditions.

## 2. Dashboard State & Data Fetching
- [ ] Update `frontend/src/pages/Dashboard.tsx`:
    - Implement `useEffect` for initial data load.
    - Fetch `catches` and `insights` concurrently using `Promise.all`.
    - Handle loading and error states with appropriate UI feedback (e.g., skeletons).

## 3. UI Data Binding
- [ ] **AI Pro Tip Section:**
    - Bind to `insights.insights[0]`.
    - Handle the "No data yet" state with the backend's fallback message.
- [ ] **Quick Stats Grid:**
    - **Total Catches:** `catches.length`.
    - **Biggest Fish:** `Math.max(...catches.map(c => c.weight || 0))`.
    - **Mock Stats:** Keep "Total Sessions" and "Hours Logged" as mock data for now.
- [ ] **Recent Catches Section:**
    - Display the 4 most recent catches.
    - **Relationship Logic:** Display the fish name (Hebrew/English) retrieved via the `fish_id` relationship.
    - Display real images from `media[0].file_url` if available.

## 4. Relationship & Validation
- [ ] Verify that each catch is correctly associated with a session (though Dashboard is read-only, this logic is critical for Plan 005).
- [ ] Ensure fish names are correctly resolved from the Fish API.

---
**Status:** Ready for implementation.
**Decisions Made:**
1. "Total Sessions" and "Hours Logged" remain mocked.
2. Catch display must show fish names from the Fish API relationship.
3. Catch creation logic (Session first) will be handled in Plan 005.
