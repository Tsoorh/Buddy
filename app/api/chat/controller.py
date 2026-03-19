import uuid
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.db_service import DbService
from app.api.chat.service import ChatService
from app.api.chat.models import GuestCreate, RoomCreate


class ChatController:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.service = ChatService(db)

    async def create_guest(self, data: GuestCreate):
        return await self.service.create_guest(data.display_name)

    async def create_room(self, data: RoomCreate):
        return await self.service.create_room(
            name=data.name,
            is_group=data.is_group,
            user_ids=data.participant_user_ids,
            guest_ids=data.participant_guest_ids,
        )

    async def get_rooms(self, user_id: uuid.UUID):
        return await self.service.get_rooms_for_user(user_id)

    async def get_messages(self, room_id: uuid.UUID):
        return await self.service.get_messages(room_id)
