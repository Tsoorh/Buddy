# Plan - Remove Time from Session Date Field

The goal is to remove the hour and minute selection from the "Date" field in the "log session" form, as it is redundant for that specific field.

## User Review Required

> [!IMPORTANT]
> I will modify the `DateTimePicker` component to optionally hide the time selection. This will affect all components using it if not handled carefully. I will ensure that by default it still shows the time, and only hide it when explicitly requested.

- Does this approach of adding a `showTime` prop to the shared `DateTimePicker` component sound good to you?

## Proposed Changes

### Frontend

#### `frontend/src/cmps/DateTimePicker.tsx`
- Add `showTime?: boolean` prop (defaults to `true`).
- Update `formatDateForInput` to return only the date part if `showTime` is `false`.
- Conditional rendering: hide the `time-section` if `showTime` is `false`.
- Adjust the layout/styles if needed when the time section is hidden.
- Update the input display value to show only the date when `showTime` is `false`.

#### `frontend/src/cmps/SessionForm.tsx`
- Pass `showTime={false}` to the `DateTimePicker` used for the "Date" field.

#### `frontend/src/cmps/DateTimePicker.css`
- Increase `z-index` of `.picker-popover` to `2000` to ensure it appears above map controls.

## Verification Plan

### Automated Tests
- I will check if there are existing tests for `DateTimePicker` or `SessionForm` and update them if necessary.
- Since this is a UI change, manual verification is usually preferred, but I can check for any regressions in logic.

### Manual Verification
- Open the "Log Session" form.
- Click on the "Date" field.
- Verify that only the calendar is shown and no time selection (Hour/Min) is visible.
- Verify that "Entry Time" and "Exit Time" still show the time selection.
- Select a date and ensure it updates correctly in the form.
