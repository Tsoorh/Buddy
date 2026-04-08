# Plan 006: Dashboard Enhancements and Data Management

This plan outlines the implementation of horizontal scrolling for recent activity, dedicated pages for viewing all data, and a secure editing flow for sessions and catches using modals.

## 1. API Service Layer Updates
- [ ] Update `frontend/src/services/SessionService.ts`:
    - Add `updateSessionApi(sessionId: string, data: SessionDetails)`: Calls `PUT /api/session/{sessionId}`.
    - Add `deleteSessionApi(sessionId: string)`: Calls `DELETE /api/session/{sessionId}`.
- [ ] Update `frontend/src/services/CatchService.ts`:
    - Add `updateCatchApi(catchId: string, data: CreateCatch)`: Calls `PUT /api/catch/{catchId}`.
    - Add `deleteCatchApi(catchId: string)`: Calls `DELETE /api/catch/{catchId}`.
    - Add `deleteCatchMediaApi(mediaId: string)`: Calls `DELETE /api/catch/media/{mediaId}`.

## 2. Dashboard UI Enhancements
- [ ] **Horizontal Scrolling Container:**
    - Create a reusable `HorizontalScroll` wrapper component with customized scrollbars (hidden or thin/cyan).
    - Add **Empty States**: Display "No sessions yet" with a link to the logger if the list is empty.
- [ ] **Recent Sessions Section:**
    - Add `Recent Sessions` section above `Recent Catches`.
    - Create `SessionCard` component displaying Location, Date, and a summary of conditions.
    - Limit to 10 most recent sessions.
- [ ] **Recent Catches Section:**
    - Wrap the existing `CatchCard` list in the `HorizontalScroll` container.
    - Limit to 10 most recent catches.

## 3. "View All" Pages
- [ ] **Catches Page (`Catches.tsx`):**
    - Responsive grid displaying all user or public catches. - depends on the URL. (Later on the catches pages will let every guest and user scroll all the public catches/sessions) and send a message to the catch/session owner. after finishing plan 006 Implement plan 007 about this topic- two main PUBLIC routes for this plan: `/catches`, `/sessions` .
    - Ownership Check: Display `Edit` and `Delete` buttons only if `item.user_id === user.id`.
- [ ] **Sessions Page (`Sessions.tsx`):**
    - Responsive grid displaying all user and public sessions.
    - Ownership Check: Display `Edit` and `Delete` buttons only if `item.user_id === user.id`.

## 4. Editing Functionality (Modals)
- [ ] **SessionEditModal:**
    - Pre-populated form with session details.
    - Logic to save changes or cancel.
- [ ] **CatchEditModal:**
    - Pre-populated form with fish species, weight, and notes.
    - Display current media with a `Delete` option for each.
    - Logic to add new media.

## 5. Feedback & UX
- [ ] Implement a simple **Toast Notification** system to confirm successful updates/deletions.
- [ ] Add **Loading States** (Spinners) during the Update/Delete operations.

## 6. Security & Ownership Logic
- [ ] Ensure the `useAuth` hook user object is used to compare `user.id` with `item.user_id` for UI visibility of management buttons.
- [ ] Frontend validation must match backend requirements (e.g., date formats, weight limits).

## 7. Routing & Navigation
- [ ] Add routes in `AppRoutes.tsx`:
    - `/catches/${userid}` (Protected)
    - `/sessions/${userid}` (Protected)
- [ ] Update `Header.tsx` or Dashboard to include navigation to these pages.

---
**Status:** Ready for implementation.
**Decisions Made:**
1. Use **Modals** for editing to maintain user context.
2. Dashboard scrolling limited to the **10 most recent items**.
3. **Delete** functionality included for full data management.
4. **Empty States** and **Toast Feedback** added for professional feel.
