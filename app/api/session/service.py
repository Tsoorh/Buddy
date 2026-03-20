from fastapi import Depends
from typing import List, Optional, Dict, Any
from .models import SessionDetails, SessionFilterBy
from app.base import Session as SessionBase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete, or_
from app.service.db_service import DbService
from .models import Session
from app.api.catch.model import Catch
from app.core.logger import setup_logger
import uuid

app_logger = setup_logger("app_logger")


class SessionService:
    def __init__(self, db: AsyncSession = Depends(DbService.get_db)):
        self.db = db

    async def get_sessions(
        self,
        filter_by: Optional[SessionFilterBy],
        current_user: Optional[Dict[str, Any]] = None,
    ) -> List[SessionBase | None]:
        query = select(SessionBase)

        if filter_by or current_user:
            conditions = self._handle_session_filter(filter_by, current_user)
            query = query.where(*conditions)
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

    # async def add_session_catch(self, session: Session, catch: Catch) -> uuid.UUID:
    #     try:
    #         if catch:
    #             print(f"catch")
    #             # wait to add catch and get id
    #         session_dict = session.model_dump()
    #         query = insert(SessionBase).values(**session_dict).returning(SessionBase.id)

    #         result = await self.db.execute(query)
    #         await self.db.commit()

    #         return result.scalar_one()
    #     except Exception:
    #         app_logger.exception("Couldn't add session with catch")
    #         await self.db.rollback()
    #         raise

    async def update_session(self, session_id: uuid.UUID, session: SessionDetails):
        try:
            query = select(SessionBase).where(SessionBase.id == session_id)
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
                # Delete associated catches
                delete_catches_query = delete(Catch).where(
                    Catch.session_id == session_id
                )
                catches_result = await self.db.execute(delete_catches_query)
                app_logger.info(
                    f"Deleted {catches_result.rowcount} catches for session {session_id}"
                )

                await self.db.delete(session)
                await self.db.commit()
                return True
            else:
                return False
        except Exception:
            app_logger.exception("Error deleting session")
            await self.db.rollback()
            raise

    def _handle_session_filter(
        self,
        filter_by: Optional[SessionFilterBy],
        current_user: Optional[Dict[str, Any]] = None,
    ):
        conditions = []

        if current_user:
            if not current_user.get("is_admin"):
                user_id_str = current_user.get("userId") or current_user.get("sub")
                if user_id_str:
                    # Only return public sessions OR sessions belonging to the current user
                    conditions.append(
                        or_(
                            SessionBase.is_public == True,
                            SessionBase.user_id == uuid.UUID(user_id_str),
                        )
                    )
        else:
            # Public user: return ONLY records where is_public == True
            conditions.append(SessionBase.is_public == True)

        if filter_by:
            if filter_by.user_id is not None:
                conditions.append(SessionBase.user_id == filter_by.user_id)
            if filter_by.date is not None:
                conditions.append(SessionBase.date == filter_by.date)
            if filter_by.location_name is not None:
                conditions.append(
                    SessionBase.location_name.ilike(f"%{filter_by.location_name}%")
                )
            if filter_by.max_depth is not None:
                conditions.append(SessionBase.min_depth <= filter_by.max_depth)
            if filter_by.min_depth is not None:
                conditions.append(SessionBase.max_depth >= filter_by.min_depth)

        return conditions
