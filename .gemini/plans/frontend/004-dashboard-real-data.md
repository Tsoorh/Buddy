# Plan 004: Dashboard Real Data Integration

This plan outlines the steps to connect the frontend Dashboard to the real backend APIs for AI insights and user catch data, replacing the current mock data.

## 1. API Service Layer Additions
- [ ] Create `frontend/src/services/CatchService.ts`:
    - Add `getCatchesApi()`: Calls `GET /api/catch/` (optionally passing `user_id` if required, though `get_optional_current_user` in the backend should handle the current user context). This will return an array of `CatchResponse` objects.
- [ ] Create `frontend/src/services/AnalyticsService.ts`:
    - Add `getInsightsApi()`: Calls `GET /api/analytics/insights`. This returns the AI-generated insights, including `insights` array and `optimal_conditions`.

## 2. Dashboard State & Data Fetching
- [ ] Update `frontend/src/pages/Dashboard.tsx`:
    - Introduce `useEffect` to fetch data on component mount.
    - Add state variables: `catches` (array of `CatchResponse`), `insights` (object/string), `isLoading` (boolean), and `error` (string | null).
    - Call `CatchService.getCatchesApi()` and `AnalyticsService.getInsightsApi()` concurrently using `Promise.all`.
    - Handle loading states (e.g., displaying a spinner or skeleton loaders) and error states gracefully.

## 3. UI Data Binding
- [ ] **AI Pro Tip Section:**
    - Replace the mock `insight` state.
    - Map the fetched `insights.insights[0]` (or a randomly selected one from the array) into the "AI Pro Tip" card.
    - If no insights exist, gracefully display the fallback message from the backend ("Log your first session...").
- [ ] **Quick Stats Grid:**
    - **Total Catches:** Compute dynamically from `catches.length`.
    - **Biggest Fish:** Compute dynamically by finding the maximum `weight` property in the `catches` array (e.g., `Math.max(...catches.map(c => c.weight || 0))`).
    - *Note:* "Total Sessions" and "Hours Logged" can remain mocked or be hidden until a Session API integration plan is created.
- [ ] **Recent Catches Section:**
    - Map over the `catches` array (sorted by `catch_time` descending, taking the top 4) to render the recent catch cards.
    - Replace mock species name, weight, and date with real data from each `CatchResponse`.
    - Render real images if `media` array is present and has `file_url`, otherwise use the fallback icon.

## 4. Testing & Validation
- [ ] Verify that an authenticated user sees their specific catches and insights.
- [ ] Test the "empty state" for a new user with no catches (ensure the UI doesn't break when arrays are empty).
- [ ] Confirm the loading indicators provide a smooth user experience.

---
**Questions for the User:**
1. Do you want to hide the "Total Sessions" and "Hours Logged" stats for now since we are only fetching catches and insights, or keep them with mock data?
2. The `CatchResponse` returns `fish_id`. Do we have a `/api/fish/` endpoint implemented to fetch the actual fish species name, or should we use a fallback name/mock for now?
