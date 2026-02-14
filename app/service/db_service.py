from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings 

DATABASE_URL = settings.DB_URL

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

class DbService:
    async def get_db():
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()