from fastapi import APIRouter, Depends, status
from .models import Token, Login, ForgotPasswordRequest, ResetPasswordRequest
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


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPasswordRequest, controller: AuthenticationController = Depends()
):
    """
    Request a password reset.
    This will always return a success response to prevent user enumeration,
    even if the email address is not in the database.
    """
    return await controller.forgot_password(request)


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest, controller: AuthenticationController = Depends()
):
    return await controller.reset_password(request)
