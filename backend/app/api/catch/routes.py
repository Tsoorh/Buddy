from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from .model import CatchResponse
from typing import Optional, List, Dict, Any
from pydantic import UUID4
from app.middleware.auth_middleware import (
    get_current_user,
    get_optional_current_user,
    verify_catch_owner,
    verify_media_owner,
)
from .service import CatchService
from .controller import CatchController
from .model import CatchFilterBy, Catch

router = APIRouter()


@router.get("/", response_model=List[CatchResponse])
async def get_catches(
    session_id: Optional[UUID4] = None,
    min_weight: Optional[float] = None,
    text: Optional[str] = None,
    user_id: Optional[UUID4] = None,
    fish_id: Optional[UUID4] = None,
    controller: CatchController = Depends(),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[CatchResponse]:
    filter_by = CatchFilterBy(
        session_id=session_id,
        min_weight=min_weight,
        text=text,
        user_id=user_id,
        fish_id=fish_id,
    )
    return await controller.get_catches(filter_by, current_user)


@router.post(
    "/", response_model=UUID4, dependencies=[Depends(get_current_user)]
)  # return the new catch id
async def add_catch(
    catch: Catch, background_tasks: BackgroundTasks, controller: CatchController = Depends()
) -> UUID4:
    return await controller.add_catch(catch, background_tasks)


@router.put(
    "/{catch_id}", response_model=UUID4, dependencies=[Depends(verify_catch_owner)]
)  # return the updated catch id
async def update_catch(
    catch_id: UUID4, catch: Catch, controller: CatchController = Depends()
) -> UUID4:
    return await controller.update_catch(catch_id, catch)


@router.delete(
    "/{catch_id}", response_model=UUID4, dependencies=[Depends(verify_catch_owner)]
)  # return deleted catch id
async def delete_catch(
    catch_id: UUID4, controller: CatchController = Depends()
) -> UUID4:
    await controller.delete_catch(catch_id)
    return catch_id


@router.post(
    "/{catch_id}/media",
    response_model=UUID4,
    dependencies=[Depends(verify_catch_owner)],
)
async def add_catch_media(
    catch_id: UUID4,
    file: UploadFile = File(...),
    controller: CatchController = Depends(),
) -> UUID4:
    return await controller.add_catch_media(catch_id, file)


@router.delete(
    "/media/{media_id}",
    response_model=UUID4,
    dependencies=[Depends(verify_media_owner)],
)
async def delete_catch_media(
    media_id: UUID4, controller: CatchController = Depends()
) -> UUID4:
    await controller.delete_catch_media(media_id)
    return media_id
