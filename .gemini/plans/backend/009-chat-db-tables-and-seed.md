# Plan: Chat DB Tables and Seed Data

## Goal
Create the database models required for the Chat API, generate migrations, and create a script to seed the database with demo data (rooms, messages, participants).

## Status
ready for implementation

## Pages to use ##
db - `app/service/db_service.py`,
base - `app/base.py` 
folder - `app/api/chat`

## Implementation Steps
- [x] **1. Define Models**: Create the SQLAlchemy models for the chat feature. Based on the previous plan, the models are:
    - `Guest`: `id`, `display_name`, `created_at`
    - `ChatRoom`: `id`, `name`, `is_group`, `created_at`
    - `Message`: `id`, `room_id`, `sender_id` (User), `guest_id` (Guest), `content` (Encrypted), `timestamp`
    - `ChatParticipant`: `room_id`, `user_id`, `guest_id`
- [x] **2. Alembic Migration**: Generate an Alembic migration script to create these tables in the database.
- [x] **3. Create Seed Script**: Create a script `app/seed_chat.py` to populate the tables with mock data.
    - Guest can be mock, users must be real users from user table!
    - Setup dependencies (`AsyncSessionLocal`, models).
    - Create a few `Guest` entries.
    - Create `ChatRoom` entries (both 1-on-1 and group chats).
    - Add `ChatParticipant` entries linking existing `User`s and `Guest`s to the rooms.
    - Generate mock `Message` entries with encrypted content (using a Fernet key) for the created rooms.

## important note ##
 - The DB doesnt contain the tables yet. 


## Questions
1. Should the SQLAlchemy models be placed in `app/base.py` alongside the other models, or in a separate file (e.g., `app/api/chat/db_models.py`) and then imported into `app/base.py` so Alembic can detect them? It is already there.
2. Do we have a specific `CHAT_ENCRYPTION_KEY` set up in `.env` for the seed script, or should the script generate and use a dummy key for the demo data? yes we have already.