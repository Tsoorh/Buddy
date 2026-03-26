from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.db_service import DbService
from .service import AnalyticsService
from app.middleware.auth_middleware import get_current_user
from typing import Dict, Any

router = APIRouter()


@router.get("/insights")
async def get_ai_insights(
    db: AsyncSession = Depends(DbService.get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Returns the latest AI-generated insights for the current user.
    If no insights exist, it triggers a refresh if the user has sessions.
    """
    user_id = current_user.get("userId") or current_user.get("sub")
    service = AnalyticsService(db)
    insights = await service.get_latest_insights(user_id)

    if not insights:
        # Check if user has any sessions to analyze
        # Note: we need to use the service logic to check if data is available
        matrix = await service._get_success_matrix(user_id)
        if matrix:
            # Trigger first-time refresh
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

    return insights
