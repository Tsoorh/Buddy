# SpearFreshFish - Frontend Documentation

This document provides essential information for frontend developers working on the SpearFreshFish application using **React** and **TypeScript**.

## 🚀 API Connection

- **Base URL**: `http://localhost:8000/api` (Local development)
- **Interactive Documentation**:
  - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
  - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Database Test**: [http://localhost:8000/test-db](http://localhost:8000/test-db)

## 🔐 Authentication Flow

The backend uses **JWT (JSON Web Tokens)** for authentication. Tokens should be included in the `Authorization` header as a Bearer token.

### Endpoints
- `POST /api/auth/register`: User registration.
- `POST /api/auth/login`: User login (returns access token).
- `POST /api/auth/forgot-password`: Password reset request.
- `POST /api/auth/reset-password`: Reset password with token.

### Example (Axios/TypeScript)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Setting the Auth Token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Login Example
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { access_token: "...", token_type: "bearer" }
};
```

## 💬 Real-time Chat (WebSockets)

The application uses **Socket.IO** for real-time messaging.

- **Namespace**: `/`
- **Events (Emitted by Frontend)**:
  - `join_room`: `{"room_id": "UUID"}`
  - `leave_room`: `{"room_id": "UUID"}`
  - `send_message`: `{"room_id": "UUID", "content": "string", "sender_id": "UUID (optional)", "guest_id": "UUID (optional)"}`
- **Listeners (Received by Frontend)**:
  - `new_message`: Receives a message object when a new message is sent to a joined room.

### Example (Socket.IO-client)
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

socket.on('connect', () => {
  console.log('Connected to socket');
});

const joinRoom = (roomId: string) => {
  socket.emit('join_room', { room_id: roomId });
};

socket.on('new_message', (message) => {
  console.log('New message received:', message);
});
```

## 🐠 Core Modules

### 1. Fish
- `GET /api/fish`: Retrieve all fish species.
- **Model**: `{ id: UUID, he_name: string, en_name: string }`

### 2. Sessions
- `GET /api/session`: List sessions.
- `POST /api/session`: Create a new session.
- `GET /api/session/{id}`: Session details.
- **Key Fields**: `location_name`, `latitude`, `longitude`, `is_public`, `entry_time`, `exit_time`.

### 3. Catches
- `POST /api/catch`: Log a catch.
- `GET /api/catch/{id}`: Retrieve catch details including media.
- **Model**: `{ user_id: UUID, fish_id: UUID, session_id: UUID, weight: number, catch_time: string, media: [...] }`

### 4. Analytics
- `GET /api/analytics/insights`: AI-powered fishing insights (uses Gemini API).

## 📁 Media Management
- Catches can have multiple media attachments (images/videos).
- Media is hosted via **Cloudinary**.
- Uploads should follow the backend file size limit (default: 100MB) and allowed extensions (`jpg`, `jpeg`, `png`, `mp4`, `mov`).

## 🛠️ Local Development Setup

1. **Start Backend**:
   ```bash
   docker-compose up -d
   ```
2. **Database Migrations** (if needed):
   ```bash
   docker exec spearfreshfish_web alembic upgrade head

   ```
3. **MailHog**: Use for testing password reset emails.
   - UI: [http://localhost:8025](http://localhost:8025)

## 🎨 Coding Conventions
- **Naming**: Event handlers in React should be named `onSomething`.
- **Styling**: Prefer Vanilla CSS for maximum flexibility.
- **Types**: Always use the generated/shared types from the backend models.

---
*Yes Sir! Happy coding!*
