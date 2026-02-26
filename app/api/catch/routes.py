from fastapi import APIRouter, Depends
from model import CatchResponse
from typing import Optional, List
from pydantic import UUID4
from service import CatchService
from controller import CatchController
from model import CatchFilterBy, Catch

router = APIRouter()


@router.get("/", response_model=CatchResponse)
async def get_catches(
    session_id: Optional[UUID4] = None,
    min_weight: Optional[float] = None,
    text: Optional[str] = None,
    user_id: Optional[UUID4] = None,
    fish_id: Optional[UUID4] = None,
    controller: CatchController = Depends(),
) -> List[CatchResponse]:
    filter_by = CatchFilterBy(
        session_id=session_id,
        min_weight=min_weight,
        text=text,
        user_id=user_id,
        fish_id=fish_id,
    )
    return await controller.get_catches(filter_by)


@router.post("/", response_model=UUID4)  # return the new catch id
async def add_catch(catch: Catch, controller: CatchController = Depends()) -> UUID4:
    return await controller.add_catch(catch)


@router.post("/{catch_id}", response_model=UUID4)  # return the updated catch id
async def add_catch(
    catch_id: UUID4, catch: Catch, controller: CatchController = Depends()
) -> UUID4:
    return await controller.update_catch(catch_id, catch)


@router.delete("/", response_model=UUID4)  # return deleted catch id
async def delete_catch(
    catch_id: UUID4, controller: CatchController = Depends()
) -> UUID4:
    return await controller.delete_catch(catch_id)
