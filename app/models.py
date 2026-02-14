from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import date, datetime

# fish
class Fish(BaseModel):
    id:UUID4
    he_name:str
    en_name:str