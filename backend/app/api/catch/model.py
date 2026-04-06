from pydantic import BaseModel, UUID4, Field, field_validator
from typing import Optional, List
from datetime import datetime


class Catch(BaseModel):
    user_id: UUID4
    fish_id: UUID4
    session_id: UUID4
    weight: Optional[float] = Field(default=None)
    free_text: Optional[str] = None
    catch_time: Optional[datetime] = None

    @field_validator("weight", mode="after")
    @classmethod
    def check_valid_weight(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Fish weight must be positive")
        return v


class CatchMediaResponse(BaseModel):
    id: UUID4
    file_url: str
    file_type: str
    uploaded_at: datetime


class CatchResponse(Catch):
    id: UUID4
    media: List[CatchMediaResponse] = []


class CatchFilterBy(BaseModel):
    user_id: Optional[UUID4] = None
    fish_id: Optional[UUID4] = None
    session_id: Optional[UUID4] = None
    min_weight: Optional[float] = None
    free_text: Optional[str] = None
