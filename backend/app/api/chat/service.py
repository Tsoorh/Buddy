import uuid
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.base import Guest, ChatRoom, ChatParticipant, Message
from cryptography.fernet import Fernet
from app.core.config import settings

encryption_key = os.environ.get("CHAT_ENCRYPTION_KEY")
if not encryption_key:
    encryption_key = getattr(settings, "CHAT_ENCRYPTION_KEY", None)
if not encryption_key:
    encryption_key = Fernet.generate_key().decode()
    os.environ["CHAT_ENCRYPTION_KEY"] = encryption_key

fernet = Fernet(encryption_key.encode())


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_guest(self, display_name: str) -> Guest:
        guest = Guest(display_name=display_name)
        self.db.add(guest)
        await self.db.commit()
        await self.db.refresh(guest)
        return guest

    async def create_room(
        self,
        name: str | None,
        is_group: bool,
        user_ids: list[str],
        guest_ids: list[str],
    ) -> ChatRoom:
        room = ChatRoom(name=name, is_group=is_group)
        self.db.add(room)
        await self.db.commit()
        await self.db.refresh(room)

        participants = []
        for uid in user_ids:
            participants.append(
                ChatParticipant(room_id=room.id, user_id=uuid.UUID(uid))
            )
        for gid in guest_ids:
            participants.append(
                ChatParticipant(room_id=room.id, guest_id=uuid.UUID(gid))
            )

        self.db.add_all(participants)
        await self.db.commit()
        return room

    async def get_rooms_for_user(self, user_id: uuid.UUID) -> list[ChatRoom]:
        query = (
            select(ChatRoom)
            .join(ChatParticipant)
            .where(ChatParticipant.user_id == user_id)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_rooms_for_guest(self, guest_id: uuid.UUID) -> list[ChatRoom]:
        query = (
            select(ChatRoom)
            .join(ChatParticipant)
            .where(ChatParticipant.guest_id == guest_id)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_messages(self, room_id: uuid.UUID) -> list[Message]:
        query = (
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.timestamp.asc())
        )
        result = await self.db.execute(query)
        messages = list(result.scalars().all())
        for msg in messages:
            if msg.content:
                try:
                    msg.content = fernet.decrypt(msg.content.encode()).decode()
                except Exception:
                    pass
        return messages

    async def save_message(
        self,
        room_id: uuid.UUID,
        content: str,
        sender_id: uuid.UUID | None,
        guest_id: uuid.UUID | None,
    ) -> Message:
        encrypted_content = fernet.encrypt(content.encode()).decode()
        message = Message(
            room_id=room_id,
            content=encrypted_content,
            sender_id=sender_id,
            guest_id=guest_id,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)

        message.content = content
        return message

    @staticmethod
    async def cleanup_old_guests(db: AsyncSession):
        from datetime import datetime, timedelta
        from sqlalchemy import delete, update

        expiration_date = datetime.utcnow() - timedelta(hours=24)

        query = select(Guest.id).where(Guest.created_at < expiration_date)
        result = await db.execute(query)
        old_guest_ids = list(result.scalars().all())

        if not old_guest_ids:
            return

        # Nullify guest references in messages
        await db.execute(
            update(Message)
            .where(Message.guest_id.in_(old_guest_ids))
            .values(guest_id=None)
        )

        # Remove guests from chat rooms
        await db.execute(
            delete(ChatParticipant).where(ChatParticipant.guest_id.in_(old_guest_ids))
        )

        # Delete guests
        await db.execute(delete(Guest).where(Guest.id.in_(old_guest_ids)))

        await db.commit()
