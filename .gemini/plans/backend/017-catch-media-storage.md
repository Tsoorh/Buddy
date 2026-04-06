# Plan: Catch Media Storage (Photo/Video)

## Summary
This plan introduces a robust system for managing media (photos and videos) associated with fishing catches using **Cloudinary**. Instead of a single image field, we will implement a dedicated `CatchMedia` table to support multiple files per catch. Files will be managed by a new `FileService` utilizing the `cloudinary` Python SDK, featuring strict validation (100MB limit) and unique naming. Cloudinary will handle automatic optimization and CDN delivery. The API will follow industry best practices with separate endpoints for media upload and deletion, ensuring a responsive frontend experience and efficient data management.

## Goal
Enable users to upload, store, and retrieve photos and videos for their fishing catches using Cloudinary.

## Status
Implemented

## Implementation Steps

- [x] **1. Database Models (`app/base.py`)**:
    - Create a `CatchMedia` table.
    - **Fields**: `id`, `catch_id` (ForeignKey), `file_url` (String), `public_id` (String - for Cloudinary deletion), `file_type` (Enum: PHOTO, VIDEO), `uploaded_at` (DateTime).
    - Update `Catch` model: Remove the legacy `image` field and add the relationship to `CatchMedia`.
    - Generate an Alembic migration script.

- [x] **2. Configuration & Security (`app/core/config.py` & `.env`)**:
    - Add Cloudinary credentials: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
    - Define `MAX_FILE_SIZE` (100MB).
    - Define `ALLOWED_EXTENSIONS` (`jpg`, `jpeg`, `png`, `mp4`, `mov`).

- [x] **3. File Management Service (`app/service/file_service.py`)**:
    - Install `cloudinary` Python SDK.
    - Implement `FileService` with:
        - `upload_to_cloudinary(file, folder)`: Handles upload to Cloudinary.
        - `delete_from_cloudinary(public_id, resource_type)`: Removes the asset from Cloudinary.
        - Validation for file size and MIME type.

- [x] **4. API Endpoints (`app/api/catch/routes.py` & `controller.py`)**:
    - `POST /api/catch/{catch_id}/media`: Accept `multipart/form-data` for upload to Cloudinary.
    - `DELETE /api/catch/media/{media_id}`: Remove record from DB and asset from Cloudinary.
    - Update `GET /api/catch/` to return the list of media URLs for each catch.

- [x] **5. Cleanup Logic**:
    - Ensure that deleting a `Catch` also triggers the deletion of all its associated media assets in Cloudinary.

## Decisions Made
1. **Storage Choice**: **Cloudinary** (Optimized image/video delivery, Generous Free Tier).
2. **Upload Limit**: **100MB** (Balanced for high-quality mobile video).
3. **Approach**: **Separate Endpoint** (`POST /api/catch/{id}/media`) for better UX and reliability.
