from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.base import Session, Catch, EnvironmentalCondition, UserInsight
from app.service.ai_service import AiService
from app.core.logger import setup_logger
from typing import List, Dict, Any, Optional
import uuid

logger = setup_logger("analytics_logger")

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AiService()

    async def refresh_user_insights(self, user_id: uuid.UUID):
        """
        Aggregates user data, sends to AI, and caches results in the UserInsight table.
        """
        success_matrix = await self._get_success_matrix(user_id)
        
        # Call AI service
        result = await self.ai_service.generate_fishing_insights(success_matrix)
        
        if result:
            # Save or Update cache
            query = select(UserInsight).where(UserInsight.user_id == user_id)
            db_res = await self.db.execute(query)
            existing_insight = db_res.scalar_one_or_none()
            
            if existing_insight:
                existing_insight.insights = result.get("insights")
                existing_insight.optimal_conditions = result.get("optimal_conditions")
                existing_insight.generated_at = func.now()
            else:
                new_insight = UserInsight(
                    user_id=user_id,
                    insights=result.get("insights"),
                    optimal_conditions=result.get("optimal_conditions")
                )
                self.db.add(new_insight)
            
            await self.db.commit()
            logger.info(f"Refreshed AI insights for user {user_id}")

    async def get_latest_insights(self, user_id: uuid.UUID) -> Optional[UserInsight]:
        query = select(UserInsight).where(UserInsight.user_id == user_id).order_by(UserInsight.generated_at.desc())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def _get_success_matrix(self, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Query correlating catches with environmental conditions.
        """
        # Select session and its environmental data, plus count of catches
        query = (
            select(
                Session.id,
                Session.date,
                EnvironmentalCondition.weather_status,
                EnvironmentalCondition.air_temperature,
                EnvironmentalCondition.water_temperature,
                EnvironmentalCondition.atmospheric_pressure,
                EnvironmentalCondition.moon_phase,
                EnvironmentalCondition.tide_status,
                EnvironmentalCondition.tide_type,
                func.count(Catch.id).label("catch_count")
            )
            .join(EnvironmentalCondition, Session.id == EnvironmentalCondition.session_id, isouter=True)
            .join(Catch, Session.id == Catch.session_id, isouter=True)
            .where(Session.user_id == user_id)
            .group_by(Session.id, EnvironmentalCondition.id)
            .order_by(Session.date.desc())
            .limit(20) # Analyze last 20 sessions
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        matrix = []
        for row in rows:
            matrix.append({
                "date": str(row.date),
                "weather": row.weather_status,
                "air_temp": row.air_temperature,
                "water_temp": row.water_temperature,
                "pressure": row.atmospheric_pressure,
                "moon": row.moon_phase,
                "tide_status": row.tide_status,
                "tide_type": row.tide_type,
                "catches": row.catch_count
            })
        
        return matrix
