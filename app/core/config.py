from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, EmailStr


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DB_URL: str
    JWT_SECRET: str = "my_super_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    smtp_server: str
    smtp_port: int
    sender_email: EmailStr
    sender_password: str
    frontend_url: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
