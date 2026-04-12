from typing import Union
from .dev import EmailService as DevEmailService
from .prod import EmailService as ProdEmailService
from app.core.logger import setup_logger
from functools import lru_cache
import os

app_logger = setup_logger("app_logger")

@lru_cache()
def get_email_service() -> Union[ProdEmailService, DevEmailService]:
    if os.getenv("APP_ENV") == "production":
        app_logger.info("Email service: Production environment")
        return ProdEmailService()
    app_logger.info("Email service: Development environment")
    return DevEmailService()
