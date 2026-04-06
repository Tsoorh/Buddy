# Plan: Seed Fish Data

## Goal
Create a script to seed the database with Mediterranean fish data provided in `app/api/fish/data.py`.

## Status
Ready for Implementation

## Implementation Steps
- [x] **1. Create Data File**: Ensure `app/api/fish/data.py` exists with the provided list.
- [x] **2. Create Seed Script**: Create `app/seed_fish.py` that:
    - Imports `AsyncSessionLocal` from `db_service.py`.
    - Imports `Fish` model from `base.py`.
    - Imports data from `data.py`.
    - Iterates and inserts data if not exists.