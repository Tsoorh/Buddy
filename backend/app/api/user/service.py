from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from app.service.db_service import DbService
from app.base import User as UserBase
from .models import UserResponse, UserUpdate
from typing import List, Optional
import uuid
from app.core.logger import setup_logger

app_logger = setup_logger("app_logger")


class UserService:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.db = db

    async def get_users_from_db(self) -> List[UserResponse]:
        try:
            query = select(UserBase)
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            app_logger.error(f"Error getting users: {e}")
            raise e

    async def get_user_by_username(self, username: str) -> UserResponse:
        try:
            query = select(UserBase).where(UserBase.user_name == username)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            app_logger.error(f"Couldn't get user: {e}")
            raise HTTPException(status_code=500, detail="Couldn't get user")

    async def get_user_by_id(self, id: uuid.UUID) -> uuid.UUID | None:
        try:
            query = select(UserBase).where(UserBase.id == id)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()
            return user.id if user else None
        except Exception as e:
            app_logger.error(f"Error getting user by id: {e}")
            raise HTTPException(status_code=500, detail="Couldn't get user")

    async def update_user(
        self, user_id: uuid.UUID, user: UserUpdate
    ) -> Optional[uuid.UUID]:
        try:
            user_dict = user.model_dump(exclude_unset=True)
            query = (
                update(UserBase)
                .where(UserBase.id == user_id)
                .values(**user_dict)
                .returning(UserBase.id)
            )

            result = await self.db.execute(query)
            await self.db.commit()

            return result.scalar_one_or_none()
        except Exception as e:
            app_logger.error(f"Error updating user: {e}")
            raise HTTPException(status_code=500, detail="Couldn't update user")
