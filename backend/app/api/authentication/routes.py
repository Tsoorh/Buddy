from fastapi import APIRouter, Depends, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from .models import Token, Login, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest
from app.api.authentication.controller import AuthenticationController
from app.api.user.models import createUser
from app.core.limiter import limiter
import uuid


router = APIRouter()


@router.post("/register", response_model=uuid.UUID, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(request: Request, user: createUser, controller: AuthenticationController = Depends()):
    return await controller.register(user)


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user: Login, controller: AuthenticationController = Depends()):
    return await controller.login(user)


@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    request: RefreshTokenRequest, controller: AuthenticationController = Depends()
):
    return await controller.refresh_access_token(request)


@router.post("/login/swagger", response_model=Token, summary="Swagger UI Login")
async def swagger_login(

    form_data: OAuth2PasswordRequestForm = Depends(),
    controller: AuthenticationController = Depends(),
):
    user = Login(email=form_data.username, password=form_data.password)
    return await controller.login(user)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")
async def forgot_password(
    request: Request, request_data: ForgotPasswordRequest, controller: AuthenticationController = Depends()
):
    """
    Request a password reset.
    This will always return a success response to prevent user enumeration,
    even if the email address is not in the database.
    """
    return await controller.forgot_password(request_data)


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest, controller: AuthenticationController = Depends()
):
    return await controller.reset_password(request)
