import os
import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from cryptography.fernet import Fernet
from app.base import ChatRoom, Message, ChatParticipant, Guest


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        key = os.getenv("CHAT_ENCRYPTION_KEY")
        if not key:
            # Warning: Using a generated key means data cannot be decrypted after restart
            # In production, ensure CHAT_ENCRYPTION_KEY is set in .env
            self.cipher_suite = Fernet(Fernet.generate_key())
        else:
            self.cipher_suite = Fernet(key.encode())

    def _encrypt(self, text: str) -> str:
        return self.cipher_suite.encrypt(text.encode()).decode()

    def _decrypt(self, text: str) -> str:
        try:
            return self.cipher_suite.decrypt(text.encode()).decode()
        except Exception:
            return "[Content Encrypted]"

    async def create_guest(self, display_name: Optional[str] = None) -> Guest:
        if not display_name:
            display_name = f"Guest-{str(uuid.uuid4())[:8]}"
        guest = Guest(display_name=display_name)
        self.db.add(guest)
        await self.db.commit()
        await self.db.refresh(guest)
        return guest

    async def create_room(
        self,
        name: Optional[str],
        is_group: bool,
        user_id: Optional[uuid.UUID] = None,
        participant_ids: List[uuid.UUID] = None,
    ) -> ChatRoom:
        room = ChatRoom(name=name, is_group=is_group)
        self.db.add(room)
        await self.db.commit()
        await self.db.refresh(room)

        # Add creator
        if user_id:
            p = ChatParticipant(room_id=room.id, user_id=user_id)
            self.db.add(p)

        # Add other participants
        if participant_ids:
            for pid in participant_ids:
                if pid != user_id:
                    p = ChatParticipant(room_id=room.id, user_id=pid)
                    self.db.add(p)

        await self.db.commit()
        return room

    async def get_user_rooms(self, user_id: uuid.UUID) -> List[ChatRoom]:
        stmt = (
            select(ChatRoom)
            .join(ChatParticipant, ChatRoom.id == ChatParticipant.room_id)
            .where(ChatParticipant.user_id == user_id)
            .order_by(desc(ChatRoom.created_at))
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_room_messages(
        self, room_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(desc(Message.timestamp))
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(stmt)
        messages = result.scalars().all()

        # Decrypt content
        for msg in messages:
            msg.content = self._decrypt(msg.content)

        return messages

    async def save_message(
        self,
        room_id: uuid.UUID,
        content: str,
        sender_id: Optional[uuid.UUID] = None,
        guest_id: Optional[uuid.UUID] = None,
    ) -> Message:
        encrypted = self._encrypt(content)
        msg = Message(
            room_id=room_id, sender_id=sender_id, guest_id=guest_id, content=encrypted
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        msg.content = content  # Return decrypted
        return msg
