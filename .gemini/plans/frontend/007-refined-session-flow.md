# Plan 007: Unified Session & Catch Workflow

This plan refines the session and catch logging experience to be more intuitive, reliable, and data-focused.

## 1. UI Infrastructure
- [ ] Create `frontend/src/cmps/SessionForm.tsx`:
    - A reusable form component containing all backend session fields (Location, Date, Times, Depth, Visibility, Privacy).
    - Used by both the standalone page and the creation modal.
- [ ] Update `frontend/src/cmps/SessionModal.tsx`:
    - Refactor `SessionEditModal` into a generic `SessionModal` that handles both **Create** and **Edit** actions.

## 2. Dedicated Session Management
- [ ] Create `frontend/src/pages/SessionLogger.tsx`:
    - A standalone page for logging a fishing session.
    - Useful for recording dives where no fish were caught or when logging trips in advance/retrospect.
- [ ] Update `AppRoutes.tsx`: Add route `/log-session`.
- [ ] Update `Dashboard.tsx` and `Sessions.tsx`: Add "Log Session" buttons that link to this new page.

## 3. Refined Catch Logger Wizard
- [ ] Update `frontend/src/pages/CatchLogger.tsx`:
    - **Step 1 (Session):**
        - Focus purely on selection.
        - "New Session" button now opens the `SessionModal`.
        - **Critical Fix:** Saving in the modal immediately updates the selection list and auto-selects the new session.
    - **Step 2 (Catch):** No longer responsible for session data.
    - **Step 3 (Media):** Standardized.

## 4. Dashboard "Active" Session Logic
- [ ] Enhance `Dashboard.tsx`:
    - If the user has a session from "Today", highlight it as the "Active Session".
    - Provide a "Log Catch to this Session" shortcut button.

## 5. Polishing & Error Handling
- [ ] Ensure `SessionService` correctly handles all date/time conversions for the backend.
- [ ] Add "Session Created" success toast.

---
**Status:** Ready for implementation.
**Key Change:** Decoupling session creation from the final catch save to prevent data loss and logical confusion.
