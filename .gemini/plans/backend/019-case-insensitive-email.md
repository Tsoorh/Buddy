# Plan: Case-Insensitive Email Handling

## Goal
Ensure that email addresses are handled in a case-insensitive manner throughout the application. This prevents issues where a user registers with "User@Example.com" but cannot log in or reset their password with "user@example.com".

## Steps

### 1. Update Backend Models
- Modify `Login`, `ForgotPasswordRequest` in `backend/app/api/authentication/models.py` to use a `field_validator` to lowercase the email address.
- Modify `User` model in `backend/app/api/user/models.py` to use a `field_validator` to lowercase the email address. This will cover registration and updates.

### 2. Update Authentication Service
- In `backend/app/api/authentication/service.py`, ensure `get_user_by_email` explicitly lowercases the input email before performing the database query.

### 3. Verification
- Test registration with a mixed-case email.
- Test login with the same email in a different case.
- Test "Forgot Password" with the same email in a different case.

## Questions
- Should I also create a database migration to lowercase all existing emails in the `user` table? (Highly recommended to avoid orphaned accounts).