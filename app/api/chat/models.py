from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime


class GuestCreate(BaseModel):
    display_name: str


class GuestResponse(BaseModel):
    id: uuid.UUID
    display_name: str
    created_at: datetime


class RoomCreate(BaseModel):
    name: Optional[str] = None
    is_group: bool = False
    participant_user_ids: List[str] = []
    participant_guest_ids: List[str] = []


class RoomResponse(BaseModel):
    id: uuid.UUID
    name: Optional[str] = None
    is_group: bool
    created_at: datetime


class MessageResponse(BaseModel):
    id: uuid.UUID
    room_id: uuid.UUID
    sender_id: Optional[uuid.UUID] = None
    guest_id: Optional[uuid.UUID] = None
    content: str
    timestamp: datetime
