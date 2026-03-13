from sqlalchemy.ext.asyncio import AsyncSession
from app.api.chat.service import ChatService
from app.api.chat.model import GuestCreate, ChatRoomCreate
import uuid


class ChatController:
    @staticmethod
    async def create_guest(data: GuestCreate, db: AsyncSession):
        service = ChatService(db)
        return await service.create_guest(data.display_name)

    @staticmethod
    async def create_room(data: ChatRoomCreate, user_id: uuid.UUID, db: AsyncSession):
        service = ChatService(db)
        return await service.create_room(
            data.name, data.is_group, user_id, data.participant_ids
        )

    @staticmethod
    async def get_my_rooms(user_id: uuid.UUID, db: AsyncSession):
        service = ChatService(db)
        return await service.get_user_rooms(user_id)

    @staticmethod
    async def get_room_messages(room_id: uuid.UUID, db: AsyncSession):
        service = ChatService(db)
        return await service.get_room_messages(room_id)
