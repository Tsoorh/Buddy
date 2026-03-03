# Plan: Connect Authentication to User Logic

## Goal
Integrate the authentication mechanism (JWT) with the user API endpoints to ensure security and proper authorization, adhering to the project's Authentication and API Layer skills.

## Status
Ready for Implementation

## Implementation Steps
- [ ] **1. Models & Schemas**: Define Pydantic schemas for User (Create, Response, Login) matching the DB schema (including `first_name`, `last_name`, `birthday`, `user_name`, `experience_years`).
- [ ] **2. Auth Service**: Implement password hashing (bcrypt) and JWT handling (PyJWT) in a service.
- [ ] **3. User Service**: Implement user creation and retrieval logic.
- [ ] **4. API Endpoints**:
    - `POST /api/auth/register`: Create new user.
    - `POST /api/auth/login`: Get access/refresh tokens (supports email or username).
    - `POST /api/auth/refresh`: Refresh access token.
    - `GET /api/users/me`: Get current user details (protected).
- [ ] **5. Security Dependency**: Implement `get_current_user` dependency for route protection.

## Important notes
1. Use the right folder inside api folder and edit/add the relevant files.
2. Any external logic to reuse can be inside the folder service as a Service type of class. 
3. Try not to change much from the existing code unless uts a must. 

## Decisions (from Q&A)
1.  **User Model**: Exists in database (verified via Alembic).
2.  **JWT Library**: `PyJWT`.
3.  **Registration Fields**: `first_name`, `last_name`, `birthday`, `user_name`, `password`, `email`, `experience_years`. Login via `email` or `user_name`.
