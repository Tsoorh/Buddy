import pytest
import socketio
import asyncio
import uuid

pytestmark = pytest.mark.asyncio


async def test_socket_connection_and_events(live_server):
    sio = socketio.AsyncClient()
    connected = asyncio.Event()
    message_received = asyncio.Event()
    received_data = {}

    @sio.on("connect")
    async def on_connect():
        connected.set()

    @sio.on("new_message")
    async def on_message(data):
        received_data.update(data)
        message_received.set()

    # 1. Connect to the live Uvicorn test server
    await sio.connect(live_server)

    # Wait until connection confirms
    await asyncio.wait_for(connected.wait(), timeout=5.0)
    assert sio.connected

    room_id = str(uuid.uuid4())

    # 2. Join Room Event
    await sio.emit("join_room", {"room_id": room_id})
    await asyncio.sleep(0.5)  # Give the server a moment to add us to the room

    # 3. Message Event
    msg_payload = {
        "room_id": room_id,
        "content": "Hello from pytest real-time!",
        "sender_id": None,
        "guest_id": None,
    }
    await sio.emit("send_message", msg_payload)
    await asyncio.sleep(1)  # Wait to ensure server processes logic properly

    await sio.disconnect()
    assert not sio.connected
