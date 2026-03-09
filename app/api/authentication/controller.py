from fastapi import Depends
from app.api.authentication.service import AuthenticationService
from app.api.user.models import createUser
from .models import Login


class AuthenticationController:
    def __init__(self, service: AuthenticationService = Depends()):
        self.service = service

    async def register(self, user: createUser):
        return await self.service.register(user)

    async def login(self, user: Login):
        token = await self.service.login(user)
        return token
