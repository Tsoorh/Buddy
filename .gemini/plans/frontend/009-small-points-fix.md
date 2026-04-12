# Plan 009: Frontend Small Points and UX Improvements

## Goal
Address a collection of small UI/UX issues and feature enhancements on the frontend to improve the overall user experience.

## Points to Fix & Implementation Steps

### 1. Dashboard Scroll Arrows
- **Issue**: Horizontal scroll arrows in "Recent Sessions/Catches" should be disabled if there's no more content to scroll.
- **Steps**:
    - [ ] Update `frontend/src/cmps/HorizontalScroll.tsx`.
    - [ ] Use `useState` to track `canScrollLeft` and `canScrollRight`.
    - [ ] Implement a `checkScroll` function using `scrollLeft`, `scrollWidth`, and `clientWidth`.
    - [ ] Use `useEffect` to attach a scroll event listener to `scrollRef.current`.
    - [ ] Add `disabled` attribute and visual feedback (opacity) to the buttons.

### 2. Post-Session Catch Logging
- **Issue**: After logging a session, allow the user to immediately add fish caught in that session.
- **Steps**:
    - [ ] Modify `frontend/src/pages/SessionLogger.tsx`.
    - [ ] After successful `SessionService.createSession`, show a success message with two buttons:
        - "Add Catches to this Session" -> Navigate to `/log-catch?sessionId={id}`.
        - "Back to Dashboard" -> Navigate to `/dashboard`.
    - [ ] Update `frontend/src/pages/CatchLogger.tsx` to use `useSearchParams` and pre-select the session if `sessionId` is present.

### 3. Date Matching Entry/Exit
- **Issue**: The session date should automatically match the entry and exit time.
- **Steps**:
    - [ ] Modify `frontend/src/cmps/SessionForm.tsx`.
    - [ ] In `onHandleChange` (or equivalent), when `entry_time` changes, extract the date (YYYY-MM-DD) and update the `date` state.

### 4. Better Time Picker Design
- **Issue**: Improve the design for choosing entry and exit times.
- **Steps**:
    - [ ] Update `SessionForm.tsx` to use a custom styled container for the "Timing" section.
    - [ ] Group Entry/Exit times together with clear icons (e.g., `LogIn`, `LogOut` from lucide-react).
    - [ ] Apply specific CSS to `datetime-local` inputs to ensure they match the theme and are easy to use on mobile.

### 5. Latest Locations Suggestions
- **Issue**: Suggest the user's latest locations when entering a location name.
- **Steps**:
    - [ ] Modify `SessionForm.tsx` to fetch recent sessions on mount using `SessionService.getSessions()`.
    - [ ] Extract unique `location_name`s from the fetched sessions.
    - [ ] Add a `<datalist id="recent-locations">` with these names.
    - [ ] Attach `list="recent-locations"` to the Location Name input field.

### 6. Satellite Map in GPS Coordinates
- **Issue**: Add a satellite view option to the map.
- **Steps**:
    - [ ] Modify `frontend/src/cmps/LocationPicker.tsx`.
    - [ ] Import `LayersControl` from `react-leaflet`.
    - [ ] Add `BaseLayer` for "Standard" (OpenStreetMap) and "Satellite" (Esri World Imagery).
    - [ ] Esri Satellite URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`.

## Questions
- For Point 2: Since we already have a `/log-catch` page, is a simple redirect with a query param preferred over a modal? (I'll proceed with redirect unless instructed otherwise).
- For Point 6: I will use Esri World Imagery as the provider for the satellite view.