import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.core.logger import setup_logger
from typing import Tuple, Optional
import asyncio

logger = setup_logger("file_service")

class FileService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True
        )

    async def upload_catch_media(self, file: UploadFile, catch_id: uuid.UUID) -> Tuple[str, str, str]:
        """
        Uploads a file to Cloudinary and returns (file_url, public_id, file_type).
        """
        # Validate file size
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        if size > settings.max_file_size:
            raise HTTPException(status_code=400, detail=f"File too large. Max size is {settings.max_file_size / 1024 / 1024}MB")

        # Validate extension
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in settings.allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file extension. Allowed: {', '.join(settings.allowed_extensions)}")

        # Determine type
        resource_type = "video" if ext in ["mp4", "mov"] else "image"
        file_type = "video" if resource_type == "video" else "photo"
        
        # Unique folder/public_id
        folder = f"spearfreshfish/catches/{catch_id}"

        try:
            # Cloudinary upload is blocking, run in thread
            upload_result = await asyncio.to_thread(
                cloudinary.uploader.upload,
                await file.read(),
                folder=folder,
                resource_type=resource_type
            )
            
            return upload_result["secure_url"], upload_result["public_id"], file_type
            
        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Could not upload file to storage")

    async def delete_from_cloudinary(self, public_id: str, file_type: str):
        """
        Deletes an asset from Cloudinary.
        """
        try:
            resource_type = "video" if file_type == "video" else "image"
            await asyncio.to_thread(
                cloudinary.uploader.destroy,
                public_id,
                resource_type=resource_type
            )
        except Exception as e:
            logger.error(f"Error deleting from Cloudinary: {e}")
