from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from app.service.db_service import DbService
from app.service.email_service.index import get_email_service
from app.base import User as UserBase
from app.api.user.models import createUser
from sqlalchemy.exc import IntegrityError
from .models import Login
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.logger import setup_logger
import uuid
import bcrypt

app_logger = setup_logger("app_logger")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class AuthenticationService:
    def __init__(
        self,
        db: AsyncSession = Depends(DbService.get_db),
        email_service=Depends(get_email_service),
    ):
        self.db = db
        self.email_service = email_service

    def _verify_password(self, plain_password, hashed_password):
        password_byte_enc = plain_password[:72].encode("utf-8")
        hashed_password_byte_enc = hashed_password.encode("utf-8")
        return bcrypt.checkpw(
            password=password_byte_enc, hashed_password=hashed_password_byte_enc
        )

    def _get_password_hash(self, password):
        pwd_bytes = password[:72].encode("utf-8")
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
        return hashed_password.decode("utf-8")

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
            email = email.lower()
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
        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this information already exists.",
            )
        except Exception as e:
            await self.db.rollback()
            app_logger.error(f"Unexpected error during registration: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An internal error occurred. - {e}",
            )

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
            data={
                "sub": db_user.email,
                "is_admin": db_user.is_admin,
                "userId": str(db_user.id),
            },
            expires_delta=access_token_expires,
        )
        refresh_token_expires = timedelta(days=7)
        refresh_token = self._create_access_token(
            data={"sub": db_user.email, "type": "refresh"},
            expires_delta=refresh_token_expires,
        )
        return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

    async def refresh_access_token(self, refresh_token: str):
        try:
            payload = jwt.decode(
                refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            email = payload.get("sub")
            token_type = payload.get("type")
            if email is None or token_type != "refresh":
                raise HTTPException(status_code=401, detail="Invalid refresh token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        db_user = await self.get_user_by_email(email)
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self._create_access_token(
            data={
                "sub": db_user.email,
                "is_admin": db_user.is_admin,
                "userId": str(db_user.id),
            },
            expires_delta=access_token_expires,
        )
        new_refresh_token_expires = timedelta(days=7)
        new_refresh_token = self._create_access_token(
            data={"sub": db_user.email, "type": "refresh"},
            expires_delta=new_refresh_token_expires,
        )
        return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh_token}

    async def forgot_password(self, email: str):
        user = await self.get_user_by_email(email)
        if user:
            expires = timedelta(minutes=15)
            token = self._create_access_token(
                data={"sub": user.email, "purpose": "reset_password"},
                expires_delta=expires,
            )
            await self.email_service.send_reset_password_email(user.email, token)

        # Always return a success message to prevent user enumeration
        return {
            "message": "If an account with that email exists, a password reset email has been sent."
        }

    async def reset_password(self, token: str, new_password: str):
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
            email = payload.get("sub")
            purpose = payload.get("purpose")
            if email is None or purpose != "reset_password":
                raise HTTPException(status_code=400, detail="Invalid token")
        except jwt.JWTError:
            raise HTTPException(status_code=400, detail="Invalid token")

        user = await self.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=400, detail="User not found")

        hashed_password = self._get_password_hash(new_password)

        stmt = (
            update(UserBase)
            .where(UserBase.email == email)
            .values(password=hashed_password)
        )
        await self.db.execute(stmt)
        await self.db.commit()

        return {"message": "Password updated successfully"}


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(DbService.get_db)
) -> UserBase:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    query = select(UserBase).where(UserBase.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user
