# Plan: Chat API Pytest Integration

## Goal
Implement comprehensive unit and integration tests for the Chat API (REST endpoints) and Socket.IO real-time events using `pytest` and `pytest-asyncio`.

## Status
Implemented

## Pages to use
- `tests/conftest.py` (for fixtures, DB setup, and test client setup)
- `tests/api/test_chat.py` (for REST API endpoints)
- `tests/api/test_chat_socket.py` (for Socket.IO real-time events)
- `requirements.txt` / `requirements-dev.txt` (to add test dependencies)

## Implementation Steps

- [x] **1. Dependencies**: 
    - Ensure `pytest`, `pytest-asyncio`, `httpx` (for async FastAPI testing), and `python-socketio[client]` are installed. (see `requirements.txt`)
- [x] **2. Test Configuration (`tests/conftest.py`)**:
    - Set up an async test database session (override the `get_db` dependency).
    - Provide an `AsyncClient` fixture for FastAPI REST endpoints.
    - Create database fixtures: mock `User`, mock `Guest`, and mock `ChatRoom`.
    - Ensure a dummy `CHAT_ENCRYPTION_KEY` is loaded into the environment variables during the test session.
- [x] **3. REST API Tests (`tests/api/test_chat.py`)**:
    - Test `POST /api/chat/guest`: Verify it successfully creates a temporary guest and returns the ID.
    - Test `POST /api/chat/room`: Verify creating both 1-on-1 and Group chats.
    - Test `GET /api/chat/`: Verify it retrieves the list of rooms for the authenticated user.
    - Test `GET /api/chat/{room_id}/messages`: Verify it retrieves the message history and properly decrypts the content.
- [x] **4. Socket.IO Tests (`tests/api/test_chat_socket.py`)**:
    - Use `socketio.AsyncClient` to connect to the ASGI app.
    - Test the `join` event: Verify the user joins the correct Socket.IO room.
    - Test the `message` event: Verify sending a message broadcasts to other users in the room and properly encrypts/saves the message to the database.

## Questions
1. Do we already have a `tests/` directory and a `conftest.py` set up for other API tests, or should I create this from scratch? create from scratch.
2. For the test database, do you prefer using a separate local PostgreSQL database (e.g., `buddy_db_test`), or should we configure an in-memory SQLite database (using `sqlite+aiosqlite`) to make tests run faster and independently? In-memory SQLite.
3. Should I go ahead and implement this plan? yes