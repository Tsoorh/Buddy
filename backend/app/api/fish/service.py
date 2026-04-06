from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.service.db_service import DbService
from .model import Fish
from app.base import Fish as FishBase
from app.core.logger import setup_logger
import uuid

app_logger = setup_logger("app_logger")


class FishService:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.db = db

    async def get_fishes(self):
        try:
            result = await self.db.execute(select(FishBase))
            return result.scalars().all()
        except Exception:
            app_logger.exception("Error fetching fishes")
            raise

    async def add_fish(self, fish: Fish) -> uuid.UUID:
        try:
            query = insert(FishBase).values(**fish.model_dump()).returning(FishBase.id)
            result = await self.db.execute(query)
            await self.db.commit()
            return result.scalar_one()
        except Exception:
            app_logger.exception("Error adding fish")
            await self.db.rollback()
            raise
