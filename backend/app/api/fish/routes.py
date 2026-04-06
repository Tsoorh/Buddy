from fastapi import APIRouter, Depends
from typing import List
from pydantic import UUID4
from .model import Fish, FishResponse
from .controller import FishController

router = APIRouter()


@router.get("/", response_model=List[FishResponse])
async def get_fishes(controller: FishController = Depends()):
    return await controller.get_fishes()


@router.post("/", response_model=UUID4)
async def add_fish(fish: Fish, controller: FishController = Depends()):
    return await controller.add_fish(fish)
