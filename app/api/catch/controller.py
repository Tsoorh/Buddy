from fastapi import Depends, HTTPException
from .service import CatchService
from .model import CatchFilterBy, CatchResponse,Catch
from typing import Optional, List
import uuid

class CatchController:
    def __init__(self, service: CatchService = Depends()):
        self.service = service
    
    async def get_catches(self, filter_by: Optional[CatchFilterBy] = None) -> List[CatchResponse]:
        try:
            return await self.service.get_catches(filter_by)
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error while fetching catches")
        
    async def add_catch(self, catch: Catch) -> uuid.UUID:
        try:
            return await self.service.add_catch(catch)
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error while trying to add catch")
        
    async def update_catch(self,catch_id:uuid.UUID,catch:Catch) -> None :
        try:
            await self.service.update_catch(catch_id,catch)
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error while trying to update catch")
    
    async def delete_catch(self,catch_id:uuid.UUID) -> None : 
        try:
            await self.service.delete_catch(catch_id)
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error while trying to delete catch")