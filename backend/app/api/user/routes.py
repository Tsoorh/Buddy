from fastapi import APIRouter, Depends
from .models import User as UserModel, UserResponse, UserUpdate
from app.api.user.controller import UserController
from typing import List, Optional
from app.middleware.auth_middleware import get_admin_user, get_current_user
from app.api.authentication.service import get_current_user as get_db_current_user
from app.base import User as UserBase
import uuid


router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserBase = Depends(get_db_current_user)):
    return current_user

@router.get("/", response_model=List[UserModel], dependencies=[Depends(get_admin_user)])
async def get_users(controller: UserController = Depends()):
    return await controller.get_users()


@router.get(
    "/{username}",
    response_model=Optional[UserResponse],
    dependencies=[Depends(get_current_user)],
)
async def get_user_by_username(username: str, controller: UserController = Depends()):
    return await controller.get_by_username(username)


@router.put(
    "/{user_id}", response_model=uuid.UUID, dependencies=[Depends(get_current_user)]
)
async def update_user(
    user_id: uuid.UUID, user: UserUpdate, controller: UserController = Depends()
):
    return await controller.update_user(user_id, user)
