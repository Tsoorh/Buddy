from fastapi import Depends, HTTPException, UploadFile, BackgroundTasks
from .service import CatchService
from .model import CatchFilterBy, CatchResponse, Catch
from app.service.file_service import FileService
from app.core.logger import setup_logger
from typing import Optional, List, Dict, Any
import uuid

app_logger = setup_logger("app_logger")

class CatchController:
    def __init__(
        self, service: CatchService = Depends(), file_service: FileService = Depends()
    ):
        self.service = service
        self.file_service = file_service

    async def get_catches(
        self,
        filter_by: Optional[CatchFilterBy] = None,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> List[CatchResponse]:
        try:
            return await self.service.get_catches(filter_by, current_user)
        except Exception:
            raise HTTPException(
                status_code=500, detail="Internal server error while fetching catches"
            )

    async def add_catch(self, catch: Catch, background_tasks: BackgroundTasks) -> uuid.UUID:
        try:
            return await self.service.add_catch(catch, background_tasks)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Internal server error while trying to add catch",
            )

    async def update_catch(self, catch_id: uuid.UUID, catch: Catch) -> None:
        try:
            await self.service.update_catch(catch_id, catch)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Internal server error while trying to update catch",
            )

    async def delete_catch(self, catch_id: uuid.UUID) -> None:
        try:
            await self.service.delete_catch(catch_id)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Internal server error while trying to delete catch",
            )

    async def add_catch_media(self, catch_id: uuid.UUID, file: UploadFile) -> uuid.UUID:
        try:
            # 1. Upload to Cloudinary
            file_url, public_id, file_type = await self.file_service.upload_catch_media(
                file, catch_id
            )

            # 2. Save to DB
            return await self.service.add_catch_media(
                catch_id, file_url, public_id, file_type
            )
        except HTTPException:
            raise
        except Exception as e:
            app_logger.error(f"Error in add_catch_media: {e}")
            raise HTTPException(
                status_code=500,
                detail="Internal server error while uploading catch media",
            )

    async def delete_catch_media(self, media_id: uuid.UUID) -> None:
        try:
            success = await self.service.delete_catch_media(media_id)
            if not success:
                raise HTTPException(status_code=404, detail="Media not found")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Internal server error while deleting catch media",
            )
