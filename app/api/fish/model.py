from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import date, datetime


# fish
class Fish(BaseModel):
    he_name: str
    en_name: str


class FishResponse(Fish):
    id: UUID4
