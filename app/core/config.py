from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DB_URL: str
    JWT_SECRET: str = "my_super_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
