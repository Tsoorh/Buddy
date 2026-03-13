from fastapi import FastAPI, Depends
import socketio
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
from app.service.socket_service import sio


app = FastAPI()


app.include_router(user_router, prefix="/api/user", tags=["Users"])
app.include_router(session_router, prefix="/api/session", tags=["Sessions"])
app.include_router(catch_router, prefix="/api/catch", tags=["Cataches"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(fish_router, prefix="/api/fish", tags=["Fish"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])


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
