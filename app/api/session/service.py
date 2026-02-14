from fastapi import Depends
from typing import List, Optional
from .models import Session as SessionModel, SessionFilterBy
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
        self, filterBy: Optional[SessionFilterBy]
    ) -> List[SessionBase]:
        query = select(SessionBase)

        if filterBy:
            condition = self.utils.handle_filter(filterBy, SessionBase)
            query = query.where(*condition)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def add_session_catch(self, session: Session, catch: Catch) -> uuid.UUID:
        try:
            if catch:
                print(f"catch")
                # wait to add catch and get id
            session_dict = session.model_dump()
            query = insert(SessionBase).values(**session_dict).returning(SessionResponse.id)
            
            result = await self.db.execute(query)
            await self.db.commit()
            
            return result.scalar_one()
        except Exception as e:
            print(f"Couldn't add session")
            app_logger.error(f"Couldn't add session: {e}")

