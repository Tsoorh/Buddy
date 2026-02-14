from fastapi import Depends,HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.service.db_service import DbService
from app.base import User as UserBase
from .models import UserResponse, createUser
from typing import List
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
            print(f"Error getting users: {e}")
            return {"status": "error", "message": str(e)}

    async def get_user_by_username(self, username: str) -> UserResponse:
        try:
            query = select(UserBase).where(UserBase.user_name == username)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            app_logger.error(f"Couldn't get user: {e}")
            raise HTTPException(status_code=500, detail="Couldn't get user")
            

    async def get_user_by_id(self, id: uuid.UUID) -> uuid.UUID:
        try:
            query = select(UserBase).where(UserBase.id == id)
            result = await self.db.execute(query)
            return result.scalar_one().id
        except Exception as e:
            print(f"Error getting id {e}")
            return {"status": "error", "message": str(e)}

    async def create_user(self, user: createUser) -> uuid.UUID:
        try:
            # make it a dictionary type
            user_dict = user.model_dump()
            
            # ** spread the values
            query = insert(UserBase).values(**user_dict).returning(UserBase.id)
            
            result = await self.db.execute(query)
            await self.db.commit()
            
            return result.scalar_one()
        except Exception as e:
            print(f"Error getting username: {e}")
            return {"status": "error", "message": str(e)}


