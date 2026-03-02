import uuid
from fastapi import Depends, HTTPException
from app.api.user.service import UserService
from .models import createUser


class UserController:
    def __init__(self, service: UserService = Depends()):
        self.service = service

    async def get_users(self):
        users = await self.service.get_users_from_db()
        if not users:
            raise HTTPException(status_code=404, detail="No user found")
        return users

    async def get_by_username(self, username: str):
        user = await self.service.get_user_by_username(username)
        if not user:
            return None
        return user

    async def add_user(self, user: createUser):
        user_id = await self.service.create_user(user)
        if not user_id:
            return "Couldn't add user"
        return user_id

    async def update_user(self, user_id: uuid.UUID, user: createUser):
        user_exist = await self.service.get_user_by_id(user_id)
        if not user_exist:
            return "Couldn't find user to update"
        user_updated = await self.service.update_user(user_id, user)
        if not user_updated:
            return "Couldn't update user"
        return user_id
