# Plan: Delete Session Catches

## Goal
Implement logic to delete all associated catches when a fishing session is deleted to ensure data consistency.

## Status
Implemented

## Implementation Steps
1.  **Locate Session Service**: Open `app/api/session/service.py`.
2.  **Update Delete Logic**: Modify the `delete_session` method.
3.  **Execute Catch Deletion**: Before deleting the session, execute a delete query on the `Catch` model filtering by the `session_id`.
    *   Use `delete(Catch).where(Catch.session_id == session_id)`.
4.  **Transaction Management**: Ensure both the catch deletion and session deletion happen within the same database transaction.
5.  **Logging**: Log the number of deleted catches.

## Decisions
1.  **Deletion Method**: Handle explicitly in the Service layer code (no migration needed).
2.  **Logging**: Log the number of deleted catches for auditing purposes.