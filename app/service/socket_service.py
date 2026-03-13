import socketio
import uuid
from app.service.db_service import AsyncSessionLocal
from app.api.chat.service import ChatService

# Create a Socket.IO Async Server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def join_room(sid, data):
    room_id = data.get("room_id")
    if room_id:
        sio.enter_room(sid, room_id)


@sio.event
async def leave_room(sid, data):
    room_id = data.get("room_id")
    if room_id:
        sio.leave_room(sid, room_id)


@sio.event
async def send_message(sid, data):
    # Expecting data = {"room_id": "...", "content": "...", "sender_id": "...", "guest_id": "..."}
    room_id = data.get("room_id")
    content = data.get("content")
    sender_id = data.get("sender_id")
    guest_id = data.get("guest_id")

    if not room_id or not content:
        return

    try:
        r_id = uuid.UUID(room_id)
        s_id = uuid.UUID(sender_id) if sender_id else None
        g_id = uuid.UUID(guest_id) if guest_id else None
    except ValueError:
        return

    async with AsyncSessionLocal() as db:
        chat_service = ChatService(db)
        message = await chat_service.save_message(
            room_id=r_id, content=content, sender_id=s_id, guest_id=g_id
        )

        response = {
            "id": str(message.id),
            "room_id": str(message.room_id),
            "content": message.content,
            "sender_id": str(message.sender_id) if message.sender_id else None,
            "guest_id": str(message.guest_id) if message.guest_id else None,
            "timestamp": message.timestamp.isoformat(),
        }

        await sio.emit("new_message", response, room=room_id)
