from pydantic import BaseModel, UUID4, Field, field_validator, model_validator
from typing import Optional
import uuid
from datetime import datetime, timezone, date


class Session(BaseModel):
    user_id: UUID4
    location_name: Optional[str] = None
    min_depth: Optional[float] = None
    max_depth: Optional[float] = None
    isPublic: bool
    free_text: Optional[str] = None
    longest_hold_down_time: Optional[int] = None
    longest_hold_down_depth: Optional[float] = None
    entry_time: Optional[datetime] = Field(default=None)
    exit_time: Optional[datetime] = Field(default=None)
    visibility: Optional[int]

    @model_validator(mode="after")
    def validate_session_logic(self) -> "Session":
        
        # check entry and exit timing
        if self.entry_time and self.exit_time:
            if self.exit_time <= self.entry_time:
                raise ValueError("Session exit time must be later than entry time")
        
        # check visibility is a positive number
        if self.visibility is not None and self.visibility < 0:
                raise ValueError("Visibility must be bigger or equal to 0 meters")
        
        # check max depth deeper than min depth
        if self.min_depth is not None and self.max_depth is not None:
            if self.max_depth < self.min_depth:
                raise ValueError("Maximum depth must be bigger or equals to minimum depth")
        
        # check longest hold-down is not deeper than max depth
        if self.max_depth and self.longest_hold_down_depth:
            if self.longest_hold_down_depth > self.max_depth:
                raise ValueError("Longest hold down depth could not be deeper then session max depth")
        
        return self

    @field_validator("entry_time", "exit_time", mode="after")
    @classmethod
    def ensure_utc_format(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return None

        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)


class SessionResponse(Session):
    id: uuid.UUID


class SessionFilterBy(BaseModel):
    user_id: Optional[UUID4] = None
    location_name: Optional[str] = None
    min_depth: Optional[float] = None
    max_depth: Optional[float] = None
    date: Optional[date] = None

