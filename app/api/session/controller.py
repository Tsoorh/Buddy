from fastapi import Depends, HTTPException
from app.api.session.service import SessionService
from app.api.catch.model import Catch
from app.api.user.service import UserService
from typing import Optional,List
from .models import SessionFilterBy, Session
import uuid


class SessionController:
    def __init__(self, service: SessionService = Depends()):
        self.service = service

    async def get_sessions(self, filter_by: Optional[SessionFilterBy] = None):
        try:
            results = await self.service.get_sessions(filter_by)
            return results
        except Exception:
            raise HTTPException(status_code=500, detail="Couldn't get sessions")

    async def add_session(self, session: Session, catches: Optional[List[Catch]] = None) -> uuid.UUID:
        # if catches:
            # catchService.addCatches
        if not session:
            raise HTTPException(status_code=400, detail="Couldn't get session to add")
        if session.user_id:
            # Assuming UserService.get_user_by_id is a static method or properly handled
            id_exist = await UserService.get_user_by_id(UserService,session.user_id)
            if not id_exist:
                raise HTTPException(status_code=404, detail="Couldn't find user")
        try:
            return await self.service.add_session(session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Couldn't add session: {e}")
