# Plan: Modern Date & Time Picker Component

## 1. Goal
Replace the default/cluttered date and time inputs with a custom, high-end SaaS-style picker. The new component will feature a split-view (Calendar on the left, Time Picker on the right) with a deep navy/dark theme and neon blue accents.

## 2. Design Specifications (Based on Request)
- **Layout:** Split-view (Left: Calendar, Right: Time Picker).
- **Theme:** Dark Mode (Deep navy backgrounds, #0a192f or similar).
- **Accents:** Soft neon blue (#64ffda or #00d4ff) for selections and active states.
- **Time Format:** 24-hour format with clear 'Hour' and 'Minute' labels.
- **Styling:** Rounded corners, crisp typography (Inter or similar), flat design aesthetic.
- **Responsiveness:** Ensure it stacks vertically on mobile devices.

## 3. Technical Approach
- **Base:** Create a reusable `DateTimePicker` component in `src/cmps/`.
- **Logic:** 
  - Use `date-fns` for date manipulation (check if already in project, otherwise use native `Date`).
  - Manage internal state for `selectedDate`, `selectedHour`, and `selectedMinute`.
- **Styling:** Vanilla CSS (as per `GEMINI.md` preference) with CSS Variables for the theme.

## 4. Proposed Steps

### Phase 1: Research & Setup
1. Check `package.json` for date libraries (e.g., `date-fns`, `dayjs`).
2. Identify all locations where date/time pickers are used (`SessionForm.tsx`, `CatchEditModal.tsx`, etc.).

### Phase 2: Component Development
1. **`DateTimePicker.tsx`**: Create the core structure.
   - Left side: Calendar grid with month/year navigation.
   - Right side: Scrollable or grid-based hour/minute selectors.
2. **`DateTimePicker.css`**: Implement the dark theme, neon accents, and split-view layout.

### Phase 3: Integration
1. Replace standard `<input type="datetime-local">` or separate date/time inputs in:
   - `SessionForm.tsx` (Session Start/End).
   - `CatchEditModal.tsx` (Catch Time).
2. Ensure the component correctly updates the parent state via an `onChange` prop.

### Phase 4: Validation
1. Verify 24-hour format logic.
2. Test responsive layout on mobile vs. desktop.
3. Confirm consistent styling across all forms.

## 5. Questions for User
1. Should the picker be an "inline" component (always visible in the form) or a "popover" (opens when clicking an input field)? popover.
2. Do we need "Quick Select" buttons (e.g., "Now", "Today", "1 hour ago")? yes, make a great UX.
3. Should the time picker use scrolling lists or a grid of numbers? best practice solution

---
*Note: I will wait for approval and answers to the questions above before starting implementation.*
