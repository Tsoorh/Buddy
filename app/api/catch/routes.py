from fastapi import APIRouter
from model import CatchResponse
from typing import Optional
from pydantic import UUID4

router = APIRouter()

@router.get('/',response_model=CatchResponse)
async def get_catches(
    session_id:Optional[UUID4],
    min_weight:Optional[float],
    text:Optional[str],
    user_id:Optional[UUID4],
    fish_id:Optional[UUID4]
):