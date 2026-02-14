from pydantic import BaseModel, EmailStr, UUID4,field_validator,Field
from datetime import date, datetime


# user
class User(BaseModel):
    first_name:str
    last_name:str
    birthday:date
    user_name:str
    is_admin:bool
    email:EmailStr
    experience_years:int = Field()
    
    @field_validator('experience_years',mode='after')
    @classmethod
    def valid_experience_years(cls,v:int) -> int:
        if v is not None and v < 0:
            raise ValueError('Years of experience must be 0 or positive')
        return v
    @field_validator('birthday',mode='after')
    @classmethod
    def valid_birthday(cls,v:date) -> date:
        if v is not None and v> date.today():
            raise ValueError('Birthday can not be a future date')
        
        if v is not None and v.year < 1900:
            raise ValueError('Birthday is too far past, are you a Zombie?')

class UserResponse(User):
    joined_at:datetime
    id:UUID4    

class createUser(User):
    password:str
    
