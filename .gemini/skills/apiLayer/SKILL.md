---
name: apiLayer
description: This skill provides an API layer that shares an endpoint with the application's backend services.
---

# API Layer Skill

## When to user this skill

This skill should be used when you need to interact with the database and get/save/update/delete data.


## How to use this skill
This skill exposes several functions for making API requests. You can call these functions directly from your code.

### General structure

Each API folder contain route.ts, controller.ts, service.ts and model.ts files.
All the routes will be exported to the main.py file.
The main.py file will get all the routes from the routes.ts files and expose them to the app like so: `app.include_router(APIName_router, prefix="/apiName", tags=["APIName"])`.
The logic is seperated between the route - only get the request and the variables, the controller - handle the logic, and the service - communicate with the database.

### Example Usage

main.ts:

```python
from app.api.user.routes import user_router

app.include_router(user_router, prefix="/user", tags=["User"])
```

routes.ts:

```python
from fastapi import APIRouter
from app.api.user.controller import user_controller


user_router = APIRouter()


@user_router.get("/")
async def get_users():
    return await user_controller.get_users()

@user_router.get("/{user_id}")
async def get_user(user_id: str):
    return await user_controller.get_user(user_id)

@user_router.post("/")
async def create_user(user: dict):
    return await user_controller.create_user(user)

@user_router.put("/{user_id}")
async def update_user(user_id: str, user: dict):
    return await user_controller.update_user(user_id, user)

@user_router.delete("/{user_id}")
async def delete_user(user_id: str):
    return await user_controller.delete_user(user_id) 
```

controller.ts:

```python

class user_controller:
    async def get_users():

    async def get_user(user_id: str):
    

    async def create_user(user: dict):
    
```

service.ts:
```python

class SessionService:
    def __init__(
        self,
        db: AsyncSession = Depends(DbService.get_db),
        utils=Depends(UtilService),
    ):
        self.db = db
        self.utils = utils

    async def get_sessions(
        self, filter_by: Optional[SessionFilterBy]
    ) -> List[SessionBase]:
        query = select(SessionBase)

        if filter_by:
            condition = self.utils.handle_filter(filter_by, SessionFilterBy)
            query = query.where(*condition)
        try:
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception:
            app_logger.exception("Error fetching sessions")
            raise

    async def add_session(self, session: Session) -> uuid.UUID:
    ...

    async def add_session_catch(self, session: Session, catch: Catch) -> uuid.UUID:
     ...

    async def update_session(self, session:Session):
      ...

    async def delete_session(self, session_id: uuid.UUID):
    ...

....
````