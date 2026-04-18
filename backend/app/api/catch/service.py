from app.service.db_service import DbService
from fastapi import Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, insert, Select, or_, update, delete
from sqlalchemy.orm import selectinload
from app.base import Catch as CatchBase, Session as SessionBase, CatchMedia
from .model import Catch, CatchFilterBy, CatchResponse
from app.service.file_service import FileService
from app.api.analytics.service import AnalyticsService
from typing import List, Optional, Dict, Any
import uuid
from app.core.logger import setup_logger

app_logger = setup_logger("app_logger")


class CatchService:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.db = db

    async def get_catches(
        self,
        filter_by: Optional[CatchFilterBy],
        current_user: Optional[Dict[str, Any]] = None,
    ) -> List[CatchResponse]:
        query = select(CatchBase).options(
            selectinload(CatchBase.media),
            selectinload(CatchBase.fish),
            selectinload(CatchBase.session)
        )
        if filter_by or current_user:
            query = self._handle_catch_filter(query, filter_by, current_user)
        try:
            response = await self.db.execute(query)
            return response.scalars().all()
        except SQLAlchemyError:
            app_logger.exception("Couldn't get catches from database")
            raise

    # add
    async def add_catch(self, catch: Catch, background_tasks: BackgroundTasks) -> uuid.UUID:
        if not catch:
            raise ValueError("No catch to add")

        catch_dict = catch.model_dump()
        query = insert(CatchBase).values(**catch_dict).returning(CatchBase.id)
        try:
            response = await self.db.execute(query)
            await self.db.commit()
            catch_id = response.scalar_one()
            
            # Trigger AI insight refresh
            if catch.user_id:
                background_tasks.add_task(AnalyticsService.trigger_background_refresh, catch.user_id)
                
            return catch_id
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
    async def delete_catch(self, catch_id: uuid.UUID) -> bool:
        if not catch_id:
            app_logger.error("No catch to delete")
            raise ValueError("No catch to delete")

        try:
            # Fetch media keys for Cloudinary cleanup before DB deletion
            media_query = select(CatchMedia).where(CatchMedia.catch_id == catch_id)
            media_res = await self.db.execute(media_query)
            media_list = media_res.scalars().all()
            
            # Delete from DB (cascade handles CatchMedia table)
            query = delete(CatchBase).where(CatchBase.id == catch_id)
            response = await self.db.execute(query)
            
            if response.rowcount == 0:
                return False

            await self.db.commit()
            
            # Cleanup Cloudinary after successful DB commit
            file_service = FileService()
            for media in media_list:
                await file_service.delete_from_cloudinary(media.public_id, media.file_type)
                
            return True

        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't delete catch")
            raise

    async def add_catch_media(
        self, catch_id: uuid.UUID, file_url: str, public_id: str, file_type: str
    ) -> uuid.UUID:
        query = insert(CatchMedia).values(
            catch_id=catch_id,
            file_url=file_url,
            public_id=public_id,
            file_type=file_type
        ).returning(CatchMedia.id)
        
        try:
            res = await self.db.execute(query)
            await self.db.commit()
            return res.scalar_one()
        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't add catch media")
            raise

    async def delete_catch_media(self, media_id: uuid.UUID) -> bool:
        try:
            # Fetch public_id for Cloudinary cleanup
            query = select(CatchMedia).where(CatchMedia.id == media_id)
            res = await self.db.execute(query)
            media = res.scalar_one_or_none()
            
            if not media:
                return False
                
            public_id = media.public_id
            file_type = media.file_type
            
            # Delete from DB
            await self.db.delete(media)
            await self.db.commit()
            
            # Cleanup Cloudinary
            file_service = FileService()
            await file_service.delete_from_cloudinary(public_id, file_type)
            
            return True
        except SQLAlchemyError:
            await self.db.rollback()
            app_logger.exception("Couldn't delete catch media")
            raise

    def _handle_catch_filter(
        self,
        query: Select,
        filter: Optional[CatchFilterBy],
        current_user: Optional[Dict[str, Any]] = None,
    ) -> Select:
        conditions = []

        is_admin = current_user.get("is_admin") if current_user else False

        if not is_admin:
            query = query.join(SessionBase, CatchBase.session_id == SessionBase.id)
            if current_user:
                user_id_str = current_user.get("userId") or current_user.get("sub")
                if user_id_str:
                    # Limit catch views to those belonging to public sessions or their own sessions
                    conditions.append(
                        or_(
                            SessionBase.is_public == True,
                            SessionBase.user_id == uuid.UUID(user_id_str),
                        )
                    )
            else:
                # Limit catch views for unauthenticated users to public sessions only
                conditions.append(SessionBase.is_public == True)

        if filter:
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
