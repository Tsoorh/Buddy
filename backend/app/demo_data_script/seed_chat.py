import asyncio
import os
import random
from cryptography.fernet import Fernet
from sqlalchemy import select
from dotenv import load_dotenv

from app.service.db_service import AsyncSessionLocal
from app.base import User, Guest, ChatRoom, ChatParticipant, Message

load_dotenv()

# Load the encryption key from the environment
ENCRYPTION_KEY = os.getenv("CHAT_ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Fallback to generate a temporary key if missing, so the seed doesn't crash
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    print(
        f"Warning: CHAT_ENCRYPTION_KEY not found in .env. Using temporary key: {ENCRYPTION_KEY}"
    )

cipher_suite = Fernet(ENCRYPTION_KEY.encode())


def encrypt_message(content: str) -> str:
    """Encrypts a message using Fernet symmetric encryption."""
    return cipher_suite.encrypt(content.encode()).decode()


async def seed_chat_data():
    async with AsyncSessionLocal() as session:
        # 1. Fetch real users from the database
        result = await session.execute(select(User))
        users = result.scalars().all()

        if len(users) < 2:
            print(
                "Not enough users to create chats. Please seed or register at least 2 users first."
            )
            return

        print(f"Found {len(users)} users. Beginning chat seed process...")

        # 2. Create Guests
        guests = [Guest(display_name="Guest-Alice"), Guest(display_name="Guest-Bob")]
        session.add_all(guests)
        await session.commit()

        for guest in guests:
            await session.refresh(guest)
        print("Created mock Guests.")

        # 3. Create Chat Rooms
        room_1on1 = ChatRoom(name="Private Chat", is_group=False)
        room_group = ChatRoom(name="Fishing Enthusiasts", is_group=True)
        session.add_all([room_1on1, room_group])
        await session.commit()

        await session.refresh(room_1on1)
        await session.refresh(room_group)
        print("Created Chat Rooms (1-on-1 & Group).")

        # 4. Add Participants
        participants = [
            ChatParticipant(room_id=room_1on1.id, user_id=users[0].id),
            ChatParticipant(room_id=room_1on1.id, user_id=users[1].id),
            ChatParticipant(room_id=room_group.id, user_id=users[0].id),
            ChatParticipant(room_id=room_group.id, user_id=users[1].id),
            ChatParticipant(room_id=room_group.id, guest_id=guests[0].id),
        ]
        session.add_all(participants)
        await session.commit()
        print("Added Participants to Chat Rooms.")

        # 5. Add Encrypted Messages
        messages = [
            Message(
                room_id=room_1on1.id,
                sender_id=users[0].id,
                content=encrypt_message("Hey, how was your fishing session?"),
            ),
            Message(
                room_id=room_1on1.id,
                sender_id=users[1].id,
                content=encrypt_message("It was great! Caught a massive Tuna."),
            ),
            Message(
                room_id=room_group.id,
                sender_id=users[0].id,
                content=encrypt_message("Welcome everyone to the fishing group!"),
            ),
            Message(
                room_id=room_group.id,
                guest_id=guests[0].id,
                content=encrypt_message("Thanks for having me! I am new here."),
            ),
            Message(
                room_id=room_group.id,
                sender_id=users[1].id,
                content=encrypt_message("Welcome Guest-Alice!"),
            ),
        ]
        session.add_all(messages)
        await session.commit()
        print("Added Encrypted Messages.")
        print("Chat database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_chat_data())
