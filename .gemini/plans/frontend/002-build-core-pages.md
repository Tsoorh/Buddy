# Plan 002: Build Core Pages (Homepage, Dashboard, Catch-Logger)

This plan outlines the implementation of the three main pages of the SpearFreshFish application, following the design standards in `DESIGN.md`.

## 1. Prerequisites
- [ ] Verify access to backend API services.
- [ ] Ensure `AuthContext` is working for protected routes.
- [ ] Install necessary dependencies (e.g., `lucide-react` for icons, `axios` for API).

## 2. Layout & Global Styling
- [ ] Update `App.css` or create a base stylesheet with the Deep Navy theme (#0B2D72).
- [ ] Implement `Header.tsx`: Logo, navigation (Home, Dashboard, Chat), and user profile/logout.
- [ ] Implement `Footer.tsx`: Basic links and copyright.
- [ ] Update `App.tsx` to include Layout components around `AppRoutes`.

## 3. Homepage (`Home.tsx`)
- [ ] Hero section with "The Ultimate Fishing Companion" headline.
- [ ] Call-to-action (CTA) buttons: "Get Started" (leads to Login/Dashboard).
- [ ] Feature overview: Tracking, Analytics, AI Insights.
- [ ] Apply "Sand" (#F6E7BC) highlights for key text.

## 4. Dashboard (`Dashboard.tsx`)
- [ ] Header: "Good morning, [User]!" greeting.
- [ ] **Weather & Tide Widget:** real data displaying temp, wind, and tide status.
- [ ] **AI Insight Card:** Highlighted banner with a "Pro Tip" from the analytics service.
- [ ] **Quick Stats:** Grid showing "Total Catches," "Active Sessions," and "Biggest Fish."
- [ ] **Latest Catches:** Horizontal scrolling list of recent logs with image thumbnails.
- [ ] "Log New Catch" button: Prominent Sunset Orange / Cyan button.

## 5. Catch-Logger Page (`CatchLogger.tsx`)
- [ ] Create `frontend/src/pages/CatchLogger.tsx`.
- [ ] Add route in `AppRoutes.tsx` as a protected route.
- [ ] **Multi-step Form Implementation:**
    - Step 1: Species Selection (Searchable dropdown- from fish API.) 
    - Step 2: Weight & Measurements (Sliders/Input).
    - Step 3: Media Upload (Cloudinary integration).
    - Step 4: Environmental Data (Fetch current weather/depth/location).
- [ ] Integration with `POST /api/catch`.

## 6. Services & Integration
- [ ] Update `CatchService.ts`: `createCatch`, `getLatestCatches`.
- [ ] Update `AnalyticsService.ts`: `getInsights`.
- [ ] Update `SessionService.ts`: `getActiveSession`, `startSession`.

## 7. Validation
- [ ] Ensure all pages are responsive (Bootstrap grid).
- [ ] Verify that non-authenticated users are redirected to Login from Dashboard/Logger.
- [ ] Check color contrast against `DESIGN.md` standards.

---
**Questions for the User:**
1. Do you have a preferred weather API for the widget, or should I use mock data for now? no, use real weatherapi. 
2. Should the Catch Logger start a new session automatically, or should the user select an existing active session? user will only add a session. not in real time. after the session!
3. Do you want to use `lucide-react` for icons or a different library? use mui-icon ( i think thats the name)
