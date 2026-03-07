# Plan: Seed Catch Data

## Goal
Create a script (`app/seed_catch.py`) to populate the `catch` table with mock data for testing and development purposes.

## Status
Implemented

## Implementation Steps
1.  **Create Seed Script**: Create `app/seed_catch.py`.
2.  **Setup Dependencies**: Import `AsyncSessionLocal` and necessary models (`User`, `Session`, `Fish`, `Catch`).
3.  **Ensure Prerequisites**:
    *   Use only existing users from the `user` table.
    *   Use only existing fishes from the `fish` table.
    *   Use only existing sessions from the `session` table.
4.  **Generate Catches**:
    *   Iterate through sessions.
    *   Create random catch entries (random weight, fish, time within session limits).
5.  **Commit**: Save changes to the database.

## Questions
*   Should we use specific fish types or random ones from the existing database? (Plan assumes random existing). Use Only existing fish in `fish` table.
*   Should the mock data cover specific edge cases (e.g., heavy weight, specific dates)? No. just use real data from the other tables like - session_id from `session` table, user_id from `user` table and fish_id from `fish` table.