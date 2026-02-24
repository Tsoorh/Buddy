from fastapi import Depends
from typing import List, Optional
from .models import SessionFilterBy
from app.base import Session as SessionBase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.service.db_service import DbService
from app.service.util_service import UtilService
from .models import Session, SessionResponse
from app.api.catch.model import Catch
from app.core.logger import setup_logger
import uuid

app_logger = setup_logger("app_logger")


class SessionService:
    def __init__(
        self,
        db: AsyncSession = Depends(DbService.get_db),
        utils=Depends(UtilService),
    ):
        self.db = db
        self.utils = utils

    async def get_sessions(
        self, filter_by: Optional[SessionFilterBy]
    ) -> List[SessionBase]:
        query = select(SessionBase)

        if filter_by:
            condition = self.utils.handle_filter(filter_by, SessionFilterBy)
            query = query.where(*condition)
        try:
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception:
            app_logger.exception("Error fetching sessions")
            raise

    async def add_session(self, session: Session) -> uuid.UUID:
        try:
            session_dict = session.model_dump()
            query = insert(SessionBase).values(**session_dict).returning(SessionBase.id)
            
            result = await self.db.execute(query)
            await self.db.commit()
            
            return result.scalar_one()
        except Exception:
            app_logger.exception("Error adding session")
            await self.db.rollback()
            raise

    async def add_session_catch(self, session: Session, catch: Catch) -> uuid.UUID:
        try:
            if catch:
                print(f"catch")
                # wait to add catch and get id
            session_dict = session.model_dump()
            query = insert(SessionBase).values(**session_dict).returning(SessionBase.id)

            result = await self.db.execute(query)
            await self.db.commit()

            return result.scalar_one()
        except Exception:
            app_logger.exception("Couldn't add session with catch")
            await self.db.rollback()
            raise

    async def update_session(self, session:Session):
        try:
            query = select(SessionBase).where(SessionBase.id == session.id)
            result = await self.db.execute(query)
            existing_session = result.scalar_one_or_none()

            if existing_session:
                for key, value in session.model_dump().items():
                    setattr(existing_session, key, value)

                await self.db.commit()
                return True
            else:
                return False
        except Exception:
            app_logger.exception("Error updating session")
            await self.db.rollback()
            raise

    async def delete_session(self, session_id: uuid.UUID):
        try:
            query = select(SessionBase).where(SessionBase.id == session_id)
            result = await self.db.execute(query)
            session = result.scalar_one_or_none()

            if session:
                await self.db.delete(session)
                await self.db.commit()
                return True
            else:
                return False
        except Exception:
            app_logger.exception("Error deleting session")
            await self.db.rollback()
            raise