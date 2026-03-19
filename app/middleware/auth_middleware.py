import os
from typing import Any, Dict

from fastapi import Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

# Token URL should match the login endpoint where users retrieve their token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In a real environment, these must come from environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


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
