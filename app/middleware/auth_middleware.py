import os
from typing import Any, Dict, Optional
import uuid

from fastapi import Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.service.db_service import DbService
from app.base import Session as SessionBase, Catch as CatchBase

# Token URL should match the login endpoint where users retrieve their token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In a real environment, these must come from environment variables
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")


async def get_current_user(
    request: Request, token: str = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Dependency to extract and validate the JWT token.

    Usage in routers:
    @router.get("/protected", dependencies=[Depends(get_current_user)])
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId") or payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Attach the user payload to the request state
        request.state.user = payload
        return payload

    except JWTError:
        raise credentials_exception


async def get_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Dependency to enforce that the currently authenticated user is an administrator.
    """
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    return current_user


async def get_optional_current_user(
    request: Request,
) -> Optional[Dict[str, Any]]:
    """
    Optional dependency to extract and validate the JWT token.
    If missing or invalid, returns None instead of raising an exception.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("userId") or payload.get("sub")

        if user_id is None:
            return None

        request.state.user = payload
        return payload

    except JWTError:
        return None


async def verify_session_owner(
    session_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(DbService.get_db),
) -> Dict[str, Any]:
    """
    Dependency to verify if the user owns the session or is an admin.
    """
    if current_user.get("is_admin"):
        return current_user

    user_id_str = current_user.get("userId") or current_user.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    query = select(SessionBase.user_id).where(SessionBase.id == session_id)
    result = await db.execute(query)
    owner_id = result.scalar_one_or_none()

    if not owner_id or str(owner_id) != str(user_id_str):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this resource",
        )

    return current_user


async def verify_catch_owner(
    catch_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(DbService.get_db),
) -> Dict[str, Any]:
    """
    Dependency to verify if the user owns the catch or is an admin.
    """
    if current_user.get("is_admin"):
        return current_user

    user_id_str = current_user.get("userId") or current_user.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    query = select(CatchBase.user_id).where(CatchBase.id == catch_id)
    result = await db.execute(query)
    owner_id = result.scalar_one_or_none()

    if not owner_id or str(owner_id) != str(user_id_str):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this resource",
        )

    return current_user


async def get_current_guest(
    request: Request, token: str = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Dependency to extract and validate the guest JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate guest credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        guest_id: str = payload.get("guest_id")

        if guest_id is None:
            raise credentials_exception

        request.state.guest = payload
        return payload
    except JWTError:
        raise credentials_exception
