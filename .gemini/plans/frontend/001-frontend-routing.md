# Plan - Frontend Routing and Auth Guards

## Objective
Implement a robust routing system in React using `react-router-dom` that separates guest (public) routes from user (private) routes.

## Key Files & Context
- `frontend/package.json`: Add dependencies.
- `frontend/src/App.tsx`: Main entry for routing.
- `frontend/src/context/AuthContext.tsx`: Manage authentication state (JWT).
- `frontend/src/routes/AppRoutes.tsx`: Define the route structure.

## Proposed Solution
1. **Dependencies:** Install `react-router-dom` and types.
2. **Auth Management:** 
   - Create an `AuthContext` to store the JWT and user information.
   - Implement basic `login`, `logout`, and `check_auth` logic.
3. **Route Guards:**
   - `ProtectedRoute`: Renders the component if authenticated, otherwise redirects to `/login`.
   - `GuestRoute`: Renders the component if NOT authenticated, otherwise redirects to `/dashboard` (or home).
4. **Folder Structure:**
   - `/src/pages/`: Landing, Login, Dashboard, etc.
   - `/src/components/layout/`: Common layout wrappers.

## Phased Implementation Plan

### Phase 1: Setup & Context
- Install `react-router-dom`.
- Create `AuthContext.tsx` and `AuthHelper.ts` for JWT handling.
- Create placeholder pages: `Home`, `Login`, `Dashboard`.

### Phase 2: Route Components
- Implement `ProtectedRoute` (Auth Guard).
- Implement `GuestRoute` (Public only).
- Setup `AppRoutes.tsx` with `BrowserRouter`.

### Phase 3: Integration
- Update `App.tsx` to use `AppRoutes`.
- Add a simple `NavBar` that changes based on auth state.

## Verification & Testing
1. Navigate to `/dashboard` as a guest -> Should redirect to `/login`.
2. Login (mocked for now or using backend) -> Should redirect to `/dashboard`.
3. Navigate to `/login` while logged in -> Should redirect to `/dashboard`.

## Questions for the User
1. Do you have a preferred styling library (Tailwind, Material UI, Shadcn, etc.) for the placeholder pages? Bootstrap
2. Should the landing page (Home) be accessible to both guests and logged-in users? Yes 
