from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.base import Session, Catch, EnvironmentalCondition, UserInsight, Fish
from app.service.ai_service import AiService
from app.core.logger import setup_logger
from typing import List, Dict, Any, Optional
import uuid

logger = setup_logger("analytics_logger")

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AiService()

    async def refresh_user_insights(self, user_id: uuid.UUID, force: bool = False):
        """
        Aggregates user data, sends to AI, and caches results in the UserInsight table.
        Implements smart logic to prevent redundant AI calls and save quota.
        """
        from datetime import datetime, timezone, timedelta
        
        # 1. Fetch current counts
        success_matrix = await self._get_success_matrix(user_id)
        total_sessions = len(success_matrix)
        total_catches = sum(len(item['catches']) for item in success_matrix)
        
        # 2. Check existing insight
        query = select(UserInsight).where(UserInsight.user_id == user_id)
        db_res = await self.db.execute(query)
        existing_insight = db_res.scalar_one_or_none()
        
        if not force and existing_insight:
            # Check if data actually changed
            if (existing_insight.last_analyzed_sessions == total_sessions and 
                existing_insight.last_analyzed_catches == total_catches):
                logger.info(f"Skipping AI refresh for user {user_id}: Data hasn't changed.")
                return

            # Check cooldown (1 hour)
            gen_at = existing_insight.generated_at
            if gen_at.tzinfo is None:
                gen_at = gen_at.replace(tzinfo=timezone.utc)
            
            if datetime.now(timezone.utc) - gen_at < timedelta(hours=1):
                logger.info(f"Skipping AI refresh for user {user_id}: Cooldown active.")
                return

        # 3. Minimum requirements check
        if total_sessions <= 1 or total_catches < 2:
            result = {
                "insights": [
                    "You're just getting started! To provide accurate insights, I need a bit more of your history.",
                    "Please collect at least 2 sessions and 2 catches to unlock your personalized data analysis."
                ],
                "optimal_conditions": "Logging more successful catches will help me identify your unique patterns."
            }
        else:
            # 4. Call AI service
            result = await self.ai_service.generate_fishing_insights(success_matrix)
        
        if result:
            # 5. Save or Update cache
            if existing_insight:
                existing_insight.insights = result.get("insights")
                existing_insight.optimal_conditions = result.get("optimal_conditions")
                existing_insight.generated_at = func.now()
                existing_insight.last_analyzed_sessions = total_sessions
                existing_insight.last_analyzed_catches = total_catches
            else:
                new_insight = UserInsight(
                    user_id=user_id,
                    insights=result.get("insights"),
                    optimal_conditions=result.get("optimal_conditions"),
                    last_analyzed_sessions=total_sessions,
                    last_analyzed_catches=total_catches
                )
                self.db.add(new_insight)
            
            await self.db.commit()
            logger.info(f"Refreshed AI insights for user {user_id} (Sessions: {total_sessions}, Catches: {total_catches})")

    async def get_latest_insights(self, user_id: uuid.UUID) -> Optional[UserInsight]:
        query = select(UserInsight).where(UserInsight.user_id == user_id).order_by(UserInsight.generated_at.desc())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def _get_success_matrix(self, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """
        Query correlating catches with environmental conditions and dive statistics.
        """
        # Fetch sessions with their environmental conditions and catches (including fish info)
        query = (
            select(Session)
            .options(
                selectinload(Session.environmental_condition),
                selectinload(Session.catches).selectinload(Catch.fish)
            )
            .where(Session.user_id == user_id)
            .order_by(Session.date.desc())
            .limit(20)
        )
        
        result = await self.db.execute(query)
        sessions = result.scalars().all()
        
        matrix = []
        for s in sessions:
            env = s.environmental_condition
            catches_data = []
            for c in (s.catches or []):
                catches_data.append({
                    "species": c.fish.en_name if c.fish else "Unknown",
                    "weight": c.weight
                })

            matrix.append({
                "date": str(s.date),
                "dive_stats": {
                    "min_depth": s.min_depth,
                    "max_depth": s.max_depth,
                    "longest_hold_down_time": s.longest_hold_down_time,
                    "longest_hold_down_depth": s.longest_hold_down_depth,
                    "visibility": s.visibility
                },
                "environmental_conditions": {
                    "weather": env.weather_status if env else None,
                    "air_temp": env.air_temperature if env else None,
                    "water_temp": env.water_temperature if env else None,
                    "pressure": env.atmospheric_pressure if env else None,
                    "moon": env.moon_phase if env else None,
                    "tide_status": env.tide_status if env else None,
                    "tide_type": env.tide_type if env else None,
                },
                "catches": catches_data
            })
        
        return matrix

    @staticmethod
    async def trigger_background_refresh(user_id: uuid.UUID, force: bool = False):
        """
        Helper for BackgroundTasks to refresh insights with a fresh DB session.
        """
        from app.service.db_service import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            service = AnalyticsService(db)
            await service.refresh_user_insights(user_id, force=force)
