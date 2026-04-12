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
    postgres_user: str
    postgres_password: str
    postgres_db: str
    chat_encryption_key: str
    gemini_api_key: str
    
    # Security
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    ratelimit_enabled: bool = True

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Media settings
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_extensions: list[str] = ["jpg", "jpeg", "png", "mp4", "mov"]

    # Admin
    email: str
    password: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
