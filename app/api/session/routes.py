from fastapi import APIRouter, Depends
from app.api.session.controller import SessionController
from .models import Session, SessionFilterBy
from app.api.catch.model import Catch
from typing import List, Optional
from .models import SessionResponse
import uuid
from datetime import date
from pydantic import UUID4

router = APIRouter()


@router.get("/", response_model=List[SessionResponse])
# def get_sessions(filterBy: Optional[SessionFilterBy] | None = None) -> List[SessionResponse]:
async def get_sessions(
    user_id: Optional[UUID4] = None,
    location_name: Optional[str] = None,
    min_depth: Optional[float] = None,
    max_depth: Optional[float] = None,
    date: Optional[date] = None,
    controller: SessionController = Depends(),
) -> List[SessionResponse]:
    filter_by = SessionFilterBy(
        user_id=user_id,
        location_name=location_name,
        min_depth=min_depth,
        max_depth=max_depth,
        date=date
    )
    return await controller.get_sessions(filter_by)


@router.post("/", response_model=uuid.UUID)
async def add_session(
    session: Session,catch:Optional[List[Catch]] = None, controller: SessionController = Depends()
) -> uuid.UUID:
    return await controller.add_session(session)

