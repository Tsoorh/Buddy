from app.service.db_service import DbService
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import  SQLAlchemyError
from sqlalchemy import select, insert, Select, or_, update, delete
from app.base import Catch as CatchBase
from .model import Catch, CatchFilterBy, CatchResponse
from typing import List, Optional
from app.service.util_service import UtilService
import uuid
from app.core.logger import setup_logger

app_logger = setup_logger("app_logger")

class CatchService:
    def __init__(
        self, db: AsyncSession = Depends(DbService.get_db), utils=Depends(UtilService)
    ):
        self.db = db
        self.utils = utils

    # get
    async def get_catches(
        self, filter_by: Optional[CatchFilterBy]
    ) -> List[CatchResponse]:
        query = select(CatchBase)
        if filter_by:
            query = self._handle_catch_filter(query, filter_by)
        try:
            response = await self.db.execute(query)
            return response.scalars().all()
        except SQLAlchemyError:
            app_logger.exception("Couldn't get catches from database")
            raise

    # add
    async def add_catch(self, catch: Catch) -> uuid.UUID:
        if not catch:
            raise ValueError("No catch to add")
        
        catch_dict = catch.model_dump()
        query = insert(CatchBase).values(**catch_dict).returning(CatchBase.id)
        try:
            response = await self.db.execute(query)
            await self.db.commit()
            return response.scalar_one()
        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't add catch")
            raise
    
    # update - return true if updated and false if couldn't find catch to update
    async def update_catch(self, catch_id: uuid.UUID, catch: Catch) -> bool:
        if not catch:
            app_logger.error("No catch to update")
            raise ValueError("No catch to update")
        
        catch_dict = catch.model_dump(exclude_unset=True)
        query = update(CatchBase).where(CatchBase.id == catch_id).values(**catch_dict)
        try:
            result = await self.db.execute(query)
            
            if result.rowcount == 0:
                return False
            
            await self.db.commit()
            return True
            
        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't update catch")
            raise
    
    # delete - return bool - if deleted
    async def delete_catch(self,catch_id:uuid.UUID) -> bool:
        if not catch_id:
            app_logger.error("No catch to delete")
            raise ValueError("No catch to delete")

        query = delete(CatchBase).where(CatchBase.id == catch_id)

        try:
            response = await self.db.execute(query)
            if response.rowcount == 0:
                return False

            await self.db.commit()
            return True

        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't delete catch")
            raise

    def _handle_catch_filter(
        self, query: Select, filter: Optional[CatchFilterBy]
    ) -> Select:
        conditions = []
        if not filter:
            return query
        if filter.user_id is not None:
            conditions.append(CatchBase.user_id == filter.user_id)
        if filter.session_id is not None:
            conditions.append(CatchBase.session_id == filter.session_id)
        if filter.fish_id is not None:
            conditions.append(CatchBase.fish_id == filter.fish_id)
        if filter.free_text is not None:
            search_term = f"%{filter.free_text}%"
            conditions.append(
                or_(
                    CatchBase.free_text.ilike(search_term),
                    CatchBase.fish.ilike(search_term),
                )
            )
        if filter.min_weight is not None:
            conditions.append(CatchBase.weight >= filter.min_weight)
        if conditions:
            return query.where(*conditions)

        return query
