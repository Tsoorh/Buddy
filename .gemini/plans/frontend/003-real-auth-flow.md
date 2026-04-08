# Plan 003: Real Authentication Flow (Login & Register)

This plan outlines the implementation of a full, API-backed authentication flow for SpearFreshFish, including refresh token support, registration, password recovery, and guest access.

## 0. Backend: Refresh Token Support (Prerequisite)
- [v] Update `backend/app/api/authentication/models.py`:
    - Update `Token` model to include `refresh_token`.
- [v] Update `backend/app/api/authentication/service.py`:
    - Add `_create_refresh_token(data, expires_delta)` method.
    - Update `login()` to generate both `access_token` and `refresh_token`.
    - Add `refresh_access_token(refresh_token)` endpoint to generate a new access token.

## 1. API Service Layer & Types
- [v] Update `frontend/src/context/AuthContext.tsx`:
    - Update `User` interface to match `UserResponse` from backend.
    - Add `isGuest: boolean` to the context state.
    - Update `login()` to handle both `access_token` and `refresh_token`.
- [v] Create `frontend/src/services/HttpService.ts`:
    - Configure `axios` instance with `baseURL`.
    - Add Request Interceptor: Attach `Authorization: Bearer <access_token>`.
    - Add Response Interceptor: If `401 Unauthorized`, attempt to refresh the token using `refresh_token`. If that fails, call `logout()`.
- [v] Update `frontend/src/services/AuthService.ts`:
    - `loginApi(email, password, rememberMe)`: `POST /api/auth/login`.
    - `registerApi(userData)`: `POST /api/auth/register` (includes first_name, last_name, user_name, birthday, phone_number).
    - `forgotPasswordApi(email)`: `POST /api/auth/forgot-password`.
    - `resetPasswordApi(token, newPassword)`: `POST /api/auth/reset-password`.
    - `refreshTokenApi(refresh_token)`: `POST /api/auth/refresh`.

## 2. Registration Page (`Register.tsx`)
- [v] Create `frontend/src/pages/Register.tsx`:
    - Complete form with all required backend fields.
    - Password validation: At least one uppercase, one lowercase, one number, and minimum 8 characters.
    - Design: Deep Navy background (`#0B2D72`), Sand text (`#F6E7BC`), Cyan buttons (`#0AC4E0`).
    - Use `<input type="date" />` for the birthday field.

## 3. Real Login Page (`Login.tsx`)
- [v] Update `frontend/src/pages/Login.tsx`:
    - Implement the login form with `email`, `password`, and "Remember Me".
    - Handle loading and error states (e.g., "Invalid credentials").
    - Navigate to `/dashboard` on success.

## 4. Password Recovery Flow
- [v] Create `frontend/src/pages/ForgotPassword.tsx`:
    - Email submission form with recovery instructions message.
- [v] Create `frontend/src/pages/ResetPassword.tsx`:
    - Password reset form (new password + confirm password).
    - Validation of token from URL.

## 5. Routing & Guards Updates
- [v] Update `frontend/src/routes/Guards.tsx`:
    - `ProtectedRoute`: Allow access if `isAuthenticated` OR `isGuest` (depending on the route).
    - `PublicRoute`: Only for non-authenticated and non-guest users (Login/Register).
- [v] Update `frontend/src/routes/AppRoutes.tsx`:
    - Add `/register`, `/forgot-password`, `/reset-password`.
    - Ensure correct wrapping with `PublicRoute` and `ProtectedRoute`.

## 6. Welcome Page & Guest Mode
- [v] Update `frontend/src/pages/Home.tsx` (WelcomePage):
    - Buttons: "Login", "Register", "Continue as Guest".
    - "Continue as Guest" sets `isGuest: true` and redirects to `/dashboard` (with limited features).

## 7. Header & UI Consistency
- [v] Update `frontend/src/cmps/Header.tsx`:
    - Display user info or "Guest Mode" label.
    - Show Logout button for both authenticated and guest users.
    - Ensure correct navigation between the new pages.

---
**Status:** Completed.
**Decisions Made:**
1. Guest Mode uses `isGuest: boolean` in context.
2. Registration uses a standard HTML5 date picker for `birthday`.
3. Refresh tokens will be implemented on the backend as part of Task 0.
