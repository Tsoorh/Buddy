from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.db_service import DbService
from .service import AnalyticsService
from app.middleware.auth_middleware import get_current_user
from typing import Dict, Any
from datetime import datetime, timezone, timedelta

router = APIRouter()


@router.get("/insights")
async def get_ai_insights(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(DbService.get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns the latest AI-generated insights for the current user.
    Triggers a background refresh if data is missing or stale (>12h).
    """
    user_id = current_user.get("userId") or current_user.get("sub")
    service = AnalyticsService(db)
    insights = await service.get_latest_insights(user_id)

    # If no insights exist, trigger immediate refresh
    if not insights:
        matrix = await service._get_success_matrix(user_id)
        if matrix:
            await service.refresh_user_insights(user_id)
            insights = await service.get_latest_insights(user_id)
        else:
            return {
                "insights": [
                    "Log your first session with catches to start seeing AI analytics!"
                ],
                "optimal_conditions": "No data yet.",
                "generated_at": None,
            }
    
    # If insights are stale (>12 hours), trigger a refresh in the background
    elif insights.generated_at:
        # Ensure generated_at is timezone-aware for comparison if it's not already
        gen_at = insights.generated_at
        if gen_at.tzinfo is None:
            gen_at = gen_at.replace(tzinfo=timezone.utc)
            
        if datetime.now(timezone.utc) - gen_at > timedelta(hours=12):
            background_tasks.add_task(AnalyticsService.trigger_background_refresh, user_id, force=True)

    return insights
