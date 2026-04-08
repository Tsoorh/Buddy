from fastapi import Depends
from app.api.authentication.service import AuthenticationService
from app.api.user.models import createUser
from .models import Login, ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest


class AuthenticationController:
    def __init__(self, service: AuthenticationService = Depends()):
        self.service = service

    async def register(self, user: createUser):
        return await self.service.register(user)

    async def login(self, user: Login):
        token = await self.service.login(user)
        return token

    async def refresh_access_token(self, request: RefreshTokenRequest):
        return await self.service.refresh_access_token(request.refresh_token)

    async def forgot_password(self, request: ForgotPasswordRequest):
        return await self.service.forgot_password(request.email)

    async def reset_password(self, request: ResetPasswordRequest):
        return await self.service.reset_password(request.token, request.new_password)

