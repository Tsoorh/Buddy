from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DB_URL: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
