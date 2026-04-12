from pydantic import BaseModel, EmailStr, UUID4, field_validator, Field, ConfigDict
from datetime import date, datetime


# user
class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    first_name: str
    last_name: str
    birthday: date
    user_name: str
    is_admin: bool = False
    email: EmailStr
    phone_number: str = Field()

    @field_validator("birthday", mode="after")
    @classmethod
    def valid_birthday(cls, v: date) -> date:
        if v is None or v > date.today():
            raise ValueError("Birthday can not be a future date")

        if v is None or v.year < 1900:
            raise ValueError("Birthday is too far past, are you a Zombie?")
        return v

    @field_validator("email", mode="after")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower() if v else v

    @field_validator("phone_number", mode="after")
    @classmethod
    def valid_phone_number(cls, v: str) -> str:
        if v is not None and not v.isdigit():
            raise ValueError("Phone number must contain only digits")
        return v


class UserResponse(User):
    joined_at: datetime
    id: UUID4


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    birthday: date | None = None
    user_name: str | None = None
    email: EmailStr | None = None
    phone_number: str | None = None

    @field_validator("email", mode="after")
    @classmethod
    def lowercase_email(cls, v: str | None) -> str | None:
        return v.lower() if v else v


class createUser(User):
    password: str
