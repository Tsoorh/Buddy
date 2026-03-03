from fastapi import APIRouter, Depends
from .models import User as UserModel, UserResponse, UserUpdate
from app.api.user.controller import UserController
from typing import List, Optional
import uuid


router = APIRouter()


@router.get("/", response_model=List[UserModel])
async def get_users(controller: UserController = Depends()):
    return await controller.get_users()


@router.get("/{username}", response_model=Optional[UserResponse])
async def get_user_by_username(username: str, controller: UserController = Depends()):
    return await controller.get_by_username(username)


@router.put("/{user_id}", response_model=uuid.UUID)
async def update_user(
    user_id: uuid.UUID, user: UserUpdate, controller: UserController = Depends()
):
    return await controller.update_user(user_id, user)
