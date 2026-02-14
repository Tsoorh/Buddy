from fastapi import APIRouter
from app.api.session.controller import SessionController
from .models import Session, SessionFilterBy
from typing import List, Optional
from .models import SessionResponse
import uuid

router = APIRouter()


@router.get("/", response_model=List[Session])
def get_sessions(filterBy: Optional[SessionFilterBy] = None) -> List[SessionResponse]:
    return SessionController.get_sessions(filterBy)


@router.post("/", response_model=uuid.UUID)
def add_session(session: Session) -> uuid.UUID:
    return SessionController.add_session(session)
