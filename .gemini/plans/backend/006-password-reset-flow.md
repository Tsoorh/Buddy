# Plan: Implement Password Reset Flow

## Goal
Add API endpoints and logic to allow users to reset their password. A token will be generated and sent to the user's email, which they can use to set a new password.

## Status
Ready for Implementation

## Implementation Steps

- [x] **pre-task** : Create real service to send an email for the user with the token in case of forgetting password. This service should be able to send emails to real email addresses. put it inside `app/service/email_service.py`

- [ ] **1. Models**: In `app/api/authentication/models.py`, create new Pydantic models for the request bodies:
    - `ForgotPasswordRequest(BaseModel)` with a single field: `email: EmailStr`.
    - `ResetPasswordRequest(BaseModel)` with two fields: `token: str` and `new_password: str`.

- [ ] **2. Service Logic**: In `app/api/authentication/service.py`, add new methods:
    - `forgot_password(email: str)`:
        - Find the user by email using the existing `get_user_by_email` method.
        - If a user is found, generate a short-lived JWT for password reset. This token will be different from the access token and will contain a specific claim (e.g., `purpose: "reset_password"`) and the user's email.
        - **(Placeholder)** The token would normally be sent via email. For this implementation, we will log the token to the console.
        - The method will always return a success response to prevent user enumeration.
    - `reset_password(token: str, new_password: str)`:
        - Decode and validate the provided token. This will involve checking the signature, expiry, and the specific `purpose` claim.
        - If the token is valid, extract the user's email.
        - Fetch the user from the database.
        - Hash the `new_password` using `_get_password_hash`.
        - Update the user's record in the database with the new password hash.

- [ ] **3. Controller Logic**: In `app/api/authentication/controller.py`, add new methods that will be called by the routes.

- [ ] **4. API Endpoints**: In `app/api/authentication/routes.py`, add two new POST endpoints to the router:
    - `POST /forgot-password`: For requesting a password reset.
    - `POST /reset-password`: For setting a new password using the token.

## Questions
1. For sending the reset token, I will log it to the console as we don't have an email service. Is this approach acceptable for now? No create a basic email service. 
2. Shall I proceed with implementing the changes based on this plan? yes