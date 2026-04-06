import uuid
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.db_service import DbService
from app.api.chat.service import ChatService
from app.api.chat.models import GuestCreate, RoomCreate
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings


class ChatController:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.service = ChatService(db)

    async def create_guest(self, data: GuestCreate):
        guest = await self.service.create_guest(data.display_name)

        expire = datetime.now() + timedelta(hours=24)
        to_encode = {"guest_id": str(guest.id), "exp": expire}
        encoded_jwt = jwt.encode(
            to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
        )
        return {
            "id": guest.id,
            "display_name": guest.display_name,
            "created_at": guest.created_at,
            "access_token": encoded_jwt,
        }

    async def create_room(self, data: RoomCreate):
        return await self.service.create_room(
            name=data.name,
            is_group=data.is_group,
            user_ids=data.participant_user_ids,
            guest_ids=data.participant_guest_ids,
        )

    async def get_rooms(self, user_id: uuid.UUID):
        return await self.service.get_rooms_for_user(user_id)

    async def get_guest_rooms(self, guest_id: uuid.UUID):
        return await self.service.get_rooms_for_guest(guest_id)

    async def get_messages(self, room_id: uuid.UUID):
        return await self.service.get_messages(room_id)
