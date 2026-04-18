# Plan: Complete Frontend Form Validation UI [COMPLETED]

Improve user experience by displaying explicit error messages next to form fields when validation fails, as requested.

## Research Findings
- `SessionForm.tsx` calculates `errors` but doesn't render them.
- `CatchEditModal.tsx` calculates `errorsList` but doesn't render them.
- `NumberInput.tsx` supports a `hint` prop for displaying errors/info, but it's not consistently used.
- `CatchLogger.tsx` already has species validation messages.

## Strategy
1. **Update `SessionForm.tsx`**:
    - Display error messages under `location_name`.
    - Pass `errors.visibility` to `NumberInput` for visibility.
    - Pass `errors.max_depth` to `NumberInput` for max depth.
    - Pass `errors.longest_hold_down_depth` to `NumberInput` for hold-down depth.
    - Display `errors.exit_time` under the Timing section.
2. **Update `CatchEditModal.tsx`**:
    - Display `errorsList.fish_id` under species selection.
    - Pass `errorsList.weight` as `hint` to `NumberInput`.
3. **Consistency Check**:
    - Ensure all `NumberInput` usages that have associated validation errors are passing the `hint` prop.

## Execution Steps

### 1. Update `SessionForm.tsx`
- Add `<small className="text-danger d-block mt-1">{errors.location_name}</small>` for location.
- Pass `hint={errors.visibility}`, `hint={errors.max_depth}`, `hint={errors.longest_hold_down_depth}` to respective `NumberInput`s.
- Add `<small className="text-danger d-block mt-1">{errors.exit_time}</small>` for exit time.

### 2. Update `CatchEditModal.tsx`
- Add `<small className="text-danger d-block mt-1">{errorsList.fish_id}</small>` for species.
- Pass `hint={errorsList.weight}` to `NumberInput` for weight.

## Verification Plan
- **Manual Verification**: 
    - Open Session Logger/Edit and trigger each error (empty location, exit before entry, max < min).
    - Open Catch Edit and trigger each error (empty species, weight <= 0).
    - Verify that the "Save" button is disabled AND the red error text appears.
