# Plan: Guest Room Retrieval and Session Persistence

## Goal
Allow returning guests (users who haven't registered but previously joined chats) to retrieve the chat rooms they belong to. This will be achieved by using their unique `guest_id` as a lightweight session token.

## Status
Pending Approval

## Implementation Steps

- [ ] **1. Service Layer (`app/api/chat/service.py`)**:
    - Add a method `get_rooms_for_guest(self, guest_id: uuid.UUID)`.
    - This method will query the `ChatRoom` table, joining with `ChatParticipant` where `ChatParticipant.guest_id == guest_id`.

- [ ] **2. Controller Layer (`app/api/chat/controller.py`)**:
    - Add a method `get_guest_rooms(self, guest_id: uuid.UUID)`.
    - This method will call the service layer and return the list of rooms.

- [ ] **3. API Routes (`app/api/chat/routes.py`)**:
    - Create a new endpoint `GET /api/chat/guest/rooms`.
    - Extract the guest's ID from the request (either via a custom header or a JWT token, depending on your preference).
    - Return the list of `RoomResponse` objects.

- [ ] **4. Frontend Integration Guide (Informational)**:
    - The frontend will need to store the `id` from the `GuestResponse` in `localStorage` upon guest creation.
    - On application load, if `localStorage.getItem("guest_id")` exists, the frontend will call the new endpoint to fetch the user's active chats instead of asking them for a display name again.

## Questions
1. **Authentication Method:** For the new `GET /api/chat/guest/rooms` endpoint, should we expect a custom header (e.g., `X-Guest-ID: <uuid>`), or would you prefer we issue a JWT token when a guest is created (similar to registered users)?
2. **Data Cleanup:** Guests are temporary. Do you want to implement a background task now to delete `Guest` records older than 24/48 hours, or should we leave that for a future optimization?
3. Do you approve this plan to begin coding the backend changes?