from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.service.db_service import DbService
from app.base import User as UserBase
from app.api.user.models import createUser
from .models import Login
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.logger import setup_logger
import uuid

app_logger = setup_logger("app_logger")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthenticationService:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.db = db

    def _verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def _get_password_hash(self, password):
        return pwd_context.hash(password)

    def _create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now() + expires_delta
        else:
            expire = datetime.now() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    async def get_user_by_email(self, email: str) -> UserBase | None:
        try:
            query = select(UserBase).where(UserBase.email == email)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            app_logger.error(f"Couldn't get user: {e}")
            raise HTTPException(status_code=500, detail="Couldn't get user")

    async def register(self, user: createUser) -> uuid.UUID:
        try:
            user_dict = user.model_dump()
            user_dict["password"] = self._get_password_hash(user_dict["password"])
            query = insert(UserBase).values(**user_dict).returning(UserBase.id)

            result = await self.db.execute(query)
            await self.db.commit()

            return result.scalar_one()
        except Exception as e:
            app_logger.error(f"Error getting username: {e}")
            return {"status": "error", "message": str(e)}

    async def login(self, user: Login):
        db_user = await self.get_user_by_email(user.email)
        if not db_user or not self._verify_password(user.password, db_user.password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self._create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
