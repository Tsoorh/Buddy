from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.service.db_service import DbService
from app.api.chat.controller import ChatController
from app.api.chat.model import (
    GuestCreate,
    GuestResponse,
    ChatRoomCreate,
    ChatRoomResponse,
    MessageResponse,
)
from app.api.authentication.service import get_current_user
from app.base import User

router = APIRouter()


@router.post(
    "/guest", response_model=GuestResponse, status_code=status.HTTP_201_CREATED
)
async def create_guest(data: GuestCreate, db: AsyncSession = Depends(DbService.get_db)):
    return await ChatController.create_guest(data, db)


@router.post(
    "/room", response_model=ChatRoomResponse, status_code=status.HTTP_201_CREATED
)
async def create_room(
    data: ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(DbService.get_db),
):
    return await ChatController.create_room(data, current_user.id, db)


@router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_my_rooms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(DbService.get_db),
):
    return await ChatController.get_my_rooms(current_user.id, db)


@router.get("/{room_id}/messages", response_model=List[MessageResponse])
async def get_room_messages(
    room_id: uuid.UUID, db: AsyncSession = Depends(DbService.get_db)
):
    return await ChatController.get_room_messages(room_id, db)
