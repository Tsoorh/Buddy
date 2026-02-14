from fastapi import APIRouter, Depends
from .models import User as UserModel,UserResponse
from app.api.user.controller import UserController
from typing import List, Optional
from .models import createUser
import uuid


router = APIRouter()


@router.get("/", response_model=List[UserModel])
async def get_users(controller: UserController = Depends()):
    return await controller.get_users()


@router.get("/{username}", response_model=Optional[UserResponse])
async def get_user_by_username(username: str, controller: UserController = Depends()):
    return await controller.get_by_username(username)


@router.post("/", response_model=uuid.UUID)
async def add_user(user: createUser, controller: UserController = Depends()):
    return await controller.add_user(user)
