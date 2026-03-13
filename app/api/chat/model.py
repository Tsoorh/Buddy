from pydantic import BaseModel, UUID4, ConfigDict
from typing import Optional, List
from datetime import datetime


# Guest Schemas
class GuestCreate(BaseModel):
    display_name: Optional[str] = None


class GuestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID4
    display_name: str
    created_at: datetime


# Message Schemas
class MessageCreate(BaseModel):
    content: str
    room_id: UUID4


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID4
    room_id: UUID4
    sender_id: Optional[UUID4] = None
    guest_id: Optional[UUID4] = None
    content: str  # Decrypted content
    timestamp: datetime


# Chat Room Schemas
class ChatRoomCreate(BaseModel):
    name: Optional[str] = None
    is_group: bool = False
    participant_ids: Optional[List[UUID4]] = []  # For adding users immediately


class ChatRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID4
    name: Optional[str] = None
    is_group: bool
    created_at: datetime


class ChatHistory(BaseModel):
    room: ChatRoomResponse
    messages: List[MessageResponse]
