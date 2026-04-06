# Plan: Public Access & Resource Authorization Middleware

## Goal
Allow unauthenticated ("public") access to view sessions and catches that are marked as `is_public=True`. Ensure that protected actions (POST, PUT, DELETE) require authentication (by middleware), and that users can only edit or delete their own resources (unless they are admins).

## Status
Ready for Approval

## Implementation Steps

- [ ] **1. Optional Auth Dependency**:
    - In `app/middleware/auth_middleware.py`, create an `get_optional_current_user` dependency. It will try to extract and validate the JWT token, but if it's missing or invalid, it will simply return `None` instead of raising a `401 Unauthorized` exception.
    
- [ ] **2. Update Route Dependencies**:
    - Modify `GET /api/session/` and `GET /api/catch/` routes to use `Depends(get_optional_current_user)` instead of `Depends(get_current_user)`.
    - Keep `Depends(get_current_user)` on POST, PUT, and DELETE routes to enforce authentication for modifications.

- [ ] **3. Fix Service Layer Filters**:
    - Update `_handle_session_filter` and `_handle_catch_filter`. Currently, if `current_user` is `None`, they might inadvertently return *all* records.
    - Logic needed:
        - If `current_user` is an admin: no restriction (return all).
        - If `current_user` is an authenticated user: return records where `is_public == True` OR `user_id == current_user.id`.
        - If `current_user` is `None` (public user): return ONLY records where `is_public == True`.

- [ ] **4. Resource Ownership Checks (Edit/Delete)**:
    - For PUT and DELETE endpoints in both Session and Catch APIs, we need to verify ownership.
    - Since we need to query the database to know who owns a specific `session_id` or `catch_id`, we will pass the `current_user` to the controller/service on update/delete actions and raise a `403 Forbidden` if the `current_user` is neither the owner nor an admin.

## Questions
1. For the resource ownership checks (Step 4), do you prefer building a specialized middleware/dependency (e.g., `verify_session_owner`) that queries the DB before hitting the route, or is it okay to handle the ownership check inside the Service/Controller layer where we already query the entity? prefer a middleware- then you can reuse.
2. Should we proceed with creating and editing the relevant files based on this plan? YES!
