from fastapi import APIRouter, Depends, status
from .models import Token, Login
from app.api.authentication.controller import AuthenticationController
from app.api.user.models import createUser
import uuid


router = APIRouter()


@router.post("/register", response_model=uuid.UUID, status_code=status.HTTP_201_CREATED)
async def register(user: createUser, controller: AuthenticationController = Depends()):
    return await controller.register(user)


@router.post("/login", response_model=Token)
async def login(user: Login, controller: AuthenticationController = Depends()):
    return await controller.login(user)
