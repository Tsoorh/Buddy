# Plan: Replace Passlib with Bcrypt

## Goal
Replace `passlib.context.CryptContext` with the `bcrypt` library in `app/api/authentication/service.py` and update dependencies.

## Status
Implemented

## Implementation Steps
- [x] **1. Dependencies**: Update `requirements.txt` to remove `passlib[bcrypt]` and add `bcrypt`.
- [x] **2. Service Logic**: Refactor `app/api/authentication/service.py`:
    - Remove `passlib` import and `pwd_context` initialization.
    - Import `bcrypt`.
    - Implement `_verify_password` using `bcrypt.checkpw`.
    - Implement `_get_password_hash` using `bcrypt.hashpw`.
    - Maintain the 72-character truncation for passwords.

## Questions
- Shall I proceed with the implementation? Yes.