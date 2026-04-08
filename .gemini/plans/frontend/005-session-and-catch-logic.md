# Plan 005: Session-First Catch Creation Logic

This plan outlines the implementation of the session-first workflow for logging catches, ensuring every catch is linked to an existing session.

## 1. API Service Layer Updates
- [ ] Create `frontend/src/services/SessionService.ts`:
    - Add `getSessionsApi()`: Calls `GET /api/session/`.
    - Add `addSessionApi(sessionData)`: Calls `POST /api/session/`. Returns the new session `uuid`.
- [ ] Update `frontend/src/services/CatchService.ts`:
    - Add `addCatchApi(catchData)`: Calls `POST /api/catch/` with the mandatory `session_id`.
- [ ] Create `frontend/src/services/FishService.ts`:
    - Add `getFishListApi()`: Calls `GET /api/fish/` to populate the species selection in the catch logger.

## 2. Catch Logger Wizard (`CatchLogger.tsx`)
- [ ] Redesign `frontend/src/pages/CatchLogger.tsx` to follow a multi-step workflow:
- [ ] **Step 1: Select or Create Session**
    - Provide a list of recent sessions for the user to pick from.
    - Provide a "Create New Session" button that opens a form (Location, Depth, Date, etc.).
    - Once a session is selected or created, store its `session_id`.
- [ ] **Step 2: Log Catch Details**
    - Show form for fish species (fetched from `FishService`), weight, and time.
    - Automatically inject the `session_id` from Step 1.
    - Integration with `CatchService.addCatchApi`.
- [ ] **Step 3: Upload Media (Optional)**
    - Allow users to upload photos using `CatchService.addCatchMedia`.

## 3. Dashboard Integration
- [ ] Connect the "Log New Catch" button on the Dashboard to the new wizard.
- [ ] Update "Total Sessions" and "Hours Logged" stats to use real data from the Session API (if Plan 004 is completed).

## 4. UI/UX & Feedback
- [ ] Ensure a smooth transition between the "Session" and "Catch" steps.
- [ ] Show success confirmations after each successful creation.
- [ ] Follow "Deep Sea" theme styling from `DESIGN.md`.

---
**Status:** Ready for implementation.
**Decisions Made:**
1. A catch CANNOT be created without a `session_id`.
2. The user can reuse a previous session or start a new one before logging a catch.
