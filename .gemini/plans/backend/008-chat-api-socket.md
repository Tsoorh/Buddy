# Plan: Implement Chat API and Socket Service

## Goal
Implement a real-time chat feature allowing users and guests to communicate in 1-on-1 or group chats using `python-socketio` for real-time capabilities and FastAPI for REST endpoints (history, room management).

## Status
In Progress

## Implementation Steps

- [x] **1. Dependencies**:
    - Add `python-socketio` (with ASGI support) to `requirements.txt`.
    - Add `cryptography` (Fernet) for message encryption.

- [x] **2. Models**: In `app/api/chat/models.py`:
    - `Guest`: `id` (UUID), `display_name`, `created_at`.
    - `ChatRoom`: `id`, `name`, `is_group`, `created_at`.
    - `Message`: `id`, `room_id`, `sender_id` (User ID, nullable), `guest_id` (Guest ID, nullable), `content` (Encrypted String), `timestamp`.
    - `ChatParticipant`: `room_id`, `user_id` (nullable), `guest_id` (nullable).

- [ ] **3. Service Layer**:
    - `app/api/chat/service.py`: Logic to store/retrieve messages. **Crucial**: Encrypt content before saving, decrypt when retrieving.
    - `app/service/socket_service.py`: initialize the `socketio.AsyncServer`. This service will handle the socket events (`connect`, `disconnect`, `join`, `leave`, `message`) and interact with the Chat Service to persist data.

- [ ] **4. Controllers**: In `app/api/chat/controller.py`:
    - Logic for HTTP endpoints.

- [ ] **5. Routes**: In `app/api/chat/routes.py`:
    - `POST /guest`: Create a temporary guest user (returns ID).
    - `POST /` (or `/room`): Create a chat room (Group or Private).
    - `GET /`: Get list of rooms for the current user.
    - `GET /{room_id}/messages`: Get history for a specific room (decrypted).

- [ ] **6. Main Integration**: Mount the Socket.IO ASGI app onto the FastAPI app in `main.py`.

## Decisions
1.  **Guest Info**: Guests can optionally provide a "Display Name". If not provided, the system will auto-generate one (e.g., "Guest-{short_uuid}").
2.  **Encryption**: `cryptography` (Fernet) will be used. `CHAT_ENCRYPTION_KEY` must be added to `.env`.
3.  **Persistence**: All messages and rooms are stored in the main Postgres DB.