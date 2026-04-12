from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import socketio
import asyncio
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.base import User as UserBase
from app.service.db_service import DbService
from app.api.user.routes import router as user_router
from app.api.session.routes import router as session_router
from app.api.catch.routes import router as catch_router
from app.api.authentication.routes import router as auth_router
from app.api.fish.routes import router as fish_router
from app.api.chat.routes import router as chat_router
from app.api.analytics.routes import router as analytics_router
from app.api.chat.service import ChatService
from app.service.socket_service import sio
from app.core.config import settings
from app.core.logger import setup_logger
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Initialize Logger
app_logger = setup_logger("app_logger")

async def guest_cleanup_task():
    while True:
        try:
            async for db in DbService.get_db():
                await ChatService.cleanup_old_guests(db)
                break
        except Exception as e:
            app_logger.error(f"Guest cleanup task failed: {e}")
        await asyncio.sleep(3600)  # Sleep for 1 hour


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(guest_cleanup_task())
    yield
    cleanup_task.cancel()


app = FastAPI(title="SpearFreshFish API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS dynamically
allowed_origins = [origin.strip() for origin in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/user", tags=["Users"])
app.include_router(session_router, prefix="/api/session", tags=["Sessions"])
app.include_router(catch_router, prefix="/api/catch", tags=["Cataches"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(fish_router, prefix="/api/fish", tags=["Fish"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/test-db")
async def test_db_connection(db: AsyncSession = Depends(DbService.get_db)):
    try:
        query = select(UserBase)
        resultCursor = await db.execute(query)
        data = resultCursor.mappings().all()
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Mount Socket.IO app - this should be the entry point for Uvicorn
sio_app = socketio.ASGIApp(sio, app)
