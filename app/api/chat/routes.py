import uuid
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt

from app.api.chat.controller import ChatController
from app.api.chat.models import (
    GuestCreate,
    RoomCreate,
    GuestResponse,
    RoomResponse,
    MessageResponse,
)
from app.service.db_service import DbService
from app.base import User
from app.core.config import settings

router = APIRouter()


async def get_current_user_id(
    request: Request, db: AsyncSession = Depends(DbService.get_db)
) -> uuid.UUID:
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        token = auth.replace("Bearer ", "")
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Unauthorized")
        query = select(User).where(User.email == email)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/guest", response_model=GuestResponse)
async def create_guest(data: GuestCreate, controller: ChatController = Depends()):
    return await controller.create_guest(data)


@router.post("", response_model=RoomResponse)
async def create_room(
    data: RoomCreate,
    controller: ChatController = Depends(),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await controller.create_room(data)


@router.get("", response_model=list[RoomResponse])
async def get_rooms(
    controller: ChatController = Depends(),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await controller.get_rooms(user_id)


@router.get("/{room_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    room_id: uuid.UUID,
    controller: ChatController = Depends(),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await controller.get_messages(room_id)
