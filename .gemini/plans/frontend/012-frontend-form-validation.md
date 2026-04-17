# Plan: Frontend Form Validation

Implement frontend validation for "Session" and "Catch" logging and editing forms to ensure data integrity before submission and improve user experience by disabling the save button when data is invalid.

## Research Findings

### Backend Constraints (from `models.py`)
- **Session:**
    - `exit_time` > `entry_time` (if both provided).
    - `visibility` >= 0.
    - `max_depth` >= `min_depth`.
    - `longest_hold_down_depth` <= `max_depth`.
    - `location_name` is effectively required in the UI.
- **Catch:**
    - `fish_id` is required.
    - `weight` > 0 (if provided).

## Strategy

1.  **Utility Validation Hook (Optional):** Consider if a shared validation logic is needed, but since the forms are relatively simple and have different fields, local validation in each component is sufficient for now.
2.  **Component Updates:**
    - Update `SessionForm.tsx`, `CatchLogger.tsx`, and `CatchEditModal.tsx`.
    - Add a `getValidationError` or `isFormValid` logic.
    - Bind the `disabled` attribute of the submit button to the validation state.
    - Display user-friendly error messages when validation fails.

## Execution Steps

### 1. Update `SessionForm.tsx`
- Add a validation function that checks:
    - `location_name` is not empty.
    - `visibility >= 0`.
    - `max_depth >= min_depth`.
    - `longest_hold_down_depth <= max_depth`.
    - `entry_time` and `exit_time` logic.
- Update the submit button to be disabled if invalid.
- Show small error messages under invalid inputs.

### 2. Update `CatchLogger.tsx`
- In Step 2 (Catch Details), validate:
    - `fish_id` is selected.
    - `weight > 0` if entered.
- Disable the "Save Catch" button in Step 3 if Step 2 data is invalid.
- Add error message for weight if it's <= 0.

### 3. Update `CatchEditModal.tsx`
- Same logic as `CatchLogger.tsx` Step 2.
- Ensure the "Save Changes" button is disabled if validation fails.

## Verification Plan

- **Manual Testing:**
    - Try to save a session with `max_depth < min_depth` -> button should be disabled.
    - Try to save a session with `exit_time < entry_time` -> button should be disabled.
    - Try to save a catch with weight `-1` -> button should be disabled.
    - Ensure valid data allows saving.
- **Automated Testing:** (If applicable)
    - Add/Update unit tests for these components if they exist. (Checked: `frontend/test` doesn't seem to exist in the tree, but let's check).

---
**Questions for User:**
1. Would you like to see explicit error messages next to the fields, or is just disabling the button enough? next to the field.
2. For weight, should we allow 0? (Backend says `v < 0` raises ValueError, so 0 is technically allowed but maybe logically we want > 0). yes bigger than zero. 
