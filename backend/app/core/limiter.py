from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address, enabled=settings.ratelimit_enabled)
