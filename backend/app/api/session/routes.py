from fastapi import APIRouter, Depends, BackgroundTasks
from .controller import SessionController
from .models import Session, SessionFilterBy
from app.api.catch.model import Catch
from typing import List, Optional, Any, Dict
from .models import SessionResponse, SessionDetails
from app.middleware.auth_middleware import (
    get_current_user,
    get_optional_current_user,
    verify_session_owner,
)
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
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[SessionResponse]:
    filter_by = SessionFilterBy(
        user_id=user_id,
        location_name=location_name,
        min_depth=min_depth,
        max_depth=max_depth,
        date=date,
    )
    return await controller.get_sessions(filter_by, current_user)


@router.post("/", response_model=uuid.UUID, dependencies=[Depends(get_current_user)])
async def add_session(
    session: Session,
    background_tasks: BackgroundTasks,
    controller: SessionController = Depends(),
) -> uuid.UUID:
    return await controller.add_session(session, background_tasks)


@router.put(
    "/{session_id}", response_model=bool, dependencies=[Depends(verify_session_owner)]
)
async def update_session(
    session_id: uuid.UUID,
    session: SessionDetails,
    controller: SessionController = Depends(),
):
    return await controller.update_session(session_id, session)


@router.delete(
    "/{session_id}", response_model=bool, dependencies=[Depends(verify_session_owner)]
)
async def delete_session(
    session_id: uuid.UUID,
    controller: SessionController = Depends(),
):
    return await controller.delete_session(session_id)
