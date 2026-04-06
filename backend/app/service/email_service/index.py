from typing import Union
from .dev import EmailService as DevEmailService
from .prod import EmailService as ProdEmailService
from functools import lru_cache
import os


@lru_cache()
def get_email_service() -> Union[ProdEmailService, DevEmailService]:
    if os.getenv("APP_ENV") == "production":
        print("Production env")
        return ProdEmailService()
    print("developement env")
    return DevEmailService()
