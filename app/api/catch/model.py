from pydantic import BaseModel, UUID4, Field, field_validator
from typing import Optional
from datetime import datetime


class Catch(BaseModel):
    user_id: UUID4
    fish_id: UUID4
    session_id: UUID4
    weight: Optional[float] = Field(default=None)
    free_text: Optional[str] = None
    image: Optional[str] = None
    catch_time: Optional[datetime] = None

    @field_validator("weight", mode="after")
    @classmethod
    def check_valid_weight(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Fish weight must be positive")
        return v


class CatchResponse(Catch):
    id: UUID4


class CatchFilterBy(BaseModel):
    user_id: Optional[UUID4] = None
    fish_id: Optional[UUID4] = None
    session_id: Optional[UUID4] = None
    min_weight: Optional[float] = None
    free_text: Optional[str] = None
