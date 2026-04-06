# Plan: Authorization Middleware

## Goal
Implement an authorization middleware to intercept incoming requests, validate the JWT token, extract the `userId`, and protect secured API routes.

## Status
Implemented

## Suggested Location
- **Middleware Logic**: Create a new file `app/middleware/auth_middleware.py` (adhering to the rule that internal helper functions go in the service folder). 
- **Integration**: Inject the middleware into the FastAPI instance in `app/main.py`.

## Important locations to place- 
    - `app/api/user`
    - `app/api/chat`
    - `app/api/session`
    - `app/api/auth`
    Make sure to find the places inside those folders that need to stay private and set the middleware.

## Implementation Steps

- [x] **1. Create Middleware Service**: 
    - Create `app/middleware/auth_middleware.py`.
    - Implement a class extending `BaseHTTPMiddleware` or a dependency function.
    - The logic will extract the `Authorization` header (Bearer token).
    - Decode and validate the JWT.
    - If valid, attach the user payload to `request.state.user`.
    - If invalid or missing on a protected route, raise a `401 Unauthorized` HTTP exception.

- [x] **2. Register Middleware**: 
    - Open `app/main.py`.
    - Import the new middleware.
    - Add it to the FastAPI app using `app.add_middleware()`.
      *(Note: As per Q1 preference, we built a dependency rather than a global middleware. It will be added to specific routers using `Depends()`.)*

## Questions
1. **Approach**: Do you prefer a global `BaseHTTPMiddleware` that checks all routes (and we define a list of "public" routes to skip), or do you prefer using FastAPI's `Depends()` dependency injection on specific routers (which is the standard FastAPI way and plays nicer with Swagger UI)? Use the best practice. I usually put it manually on each route.
2. **JWT Library**: Are we using `python-jose` or `PyJWT` for decoding the tokens? python-jose
