from fastapi import Depends
from app.api.authentication.service import AuthenticationService
from app.api.user.models import createUser
from .models import Login


class AuthenticationController:
    def __init__(self, service: AuthenticationService = Depends()):
        self.service = service

    async def register(self, user: createUser):
        user_id = await self.service.register(user)
        if not user_id:
            return "Couldn't add user"
        return user_id

    async def login(self, user: Login):
        token = await self.service.login(user)
        return token
