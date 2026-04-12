# Plan: Center Login and Register Forms

## Goal
The goal is to properly center the login and register forms on the page. Currently, the `auth-container` class in `frontend/src/index.css` has a typo in its property name, preventing it from centering its content horizontally.

## Steps
1. **Identify the bug**: The `auth-container` class in `frontend/src/index.css` uses `justifyContent: center;` which is a JavaScript style notation. In CSS, it should be `justify-content: center;`.
2. **Apply the fix**: Replace `justifyContent: center;` with `justify-content: center;` in `frontend/src/index.css`.
3. **Verify the change**: Since this is a visual change in a CSS file, I will confirm the modification is applied correctly.

## Questions
- None. The fix is straightforward.
