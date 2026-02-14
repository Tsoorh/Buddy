from fastapi import Depends, HTTPException
from app.api.session.service import SessionService
from app.api.user.service import UserService
from typing import Optional
from .models import SessionFilterBy, Session
import uuid


class SessionController:
    def __init__(self, service: SessionService = Depends()):
        self.service = service

    async def get_sessions(self, filterBy: Optional[SessionFilterBy] = None):
        try:
            results = await self.service.get_sessions(filterBy)
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Couldn't get sessions")

    async def add_session(self, session: Session) -> uuid.UUID:
        if not session:
            raise HTTPException("Couldn't get session to add")
        if session.user_id:
            id_exist = await UserService.get_user_by_id
            if not id_exist:
                raise HTTPException("Couldn't find user")
        try:
            return await SessionService.add_session(session)
        except Exception as e:
            print(f"Couldn't add session{e}")
