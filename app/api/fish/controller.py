from fastapi import Depends, HTTPException
from typing import List
from .service import FishService
from .models import Fish, FishResponse
import uuid


class FishController:
    def __init__(self, service: FishService = Depends()):
        self.service = service

    async def get_fishes(self) -> List[FishResponse]:
        try:
            return await self.service.get_fishes()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Couldn't get fishes: {e}")

    async def add_fish(self, fish: Fish) -> uuid.UUID:
        try:
            return await self.service.add_fish(fish)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Couldn't add fish: {e}")
