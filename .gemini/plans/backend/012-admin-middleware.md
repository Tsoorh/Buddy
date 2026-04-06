# Plan: Admin Middleware

## Goal
Create a dependency/middleware to restrict access to specific FastAPI endpoints so that only users with administrative privileges (`is_admin=True`) can access them.

## Status
Ready for Implementation

## Implementation Steps
- [ ] **1. Create Admin Dependency**: 
    - Add a new dependency function `get_admin_user` in `app/middleware/auth_middleware.py`.
    - This function will depend on the existing `get_current_user` dependency.
- [ ] **2. Authorization Logic**: 
    - Extract the user information.
    - Verify if the `is_admin` flag is set to `True`.
    - If not, raise an `HTTPException` with status code `403 Forbidden`.
- [ ] **3. Payload/DB Check Update**: 
    - Ensure that the JWT token payload includes the `is_admin` flag upon login, OR inject a database session to fetch the fresh user record to check the admin status.

## Questions
1. Should we store the `is_admin` flag directly in the JWT payload (faster, but requires re-login if status changes), or should the dependency query the database for the user to check their current `is_admin` status (slightly slower, but always up-to-date)? check the JWT is admin.
2. Do you have any specific endpoints right now that we should immediately protect with this new admin dependency? yes, inside user api (not every user allowed to see other users). also protect private sessions and related catches.