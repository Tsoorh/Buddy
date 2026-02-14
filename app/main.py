from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.base import User as UserBase
from app.service.db_service import DbService 
from app.api.user.routes import router as user_router
from app.api.session.routes import router as session_router


app = FastAPI()


app.include_router(user_router,prefix="/api/user",tags=["Users"])
app.include_router(session_router,prefix="/api/session",tags=["Sessions"])



@app.get("/test-db")
async def test_db_connection(db: AsyncSession = Depends(DbService.get_db)):
    try:
        query = select(UserBase)
        resultCursor = await db.execute(query)
        data = resultCursor.mappings().all()
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}