import pytest
import pytest_asyncio
import asyncio
import os
import uuid
import uvicorn
import httpx
import socketio
from cryptography.fernet import Fernet

# Set environment variables for testing before loading the app
os.environ["CHAT_ENCRYPTION_KEY"] = Fernet.generate_key().decode()
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ALGORITHM"] = "HS256"
# Ensure the test doesn't accidentally hit the prod DB if not mocked right
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient, ASGITransport

# Test Database Setup (In-Memory SQLite)
engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Monkeypatch db_service BEFORE importing app.main so other modules get the patched objects
import app.service.db_service as db_service

db_service.engine = engine
db_service.AsyncSessionLocal = TestingSessionLocal

from app.main import app
from app.base import Base
from app.base import User
from jose import jwt
from app.core.config import settings
from datetime import datetime, timedelta


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
def override_get_db_fixture(db_session):
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[db_service.DbService.get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client(override_get_db_fixture):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def test_user(db_session):
    user_email = f"test_{uuid.uuid4()}@example.com"
    user = User(
        email=user_email,
        user_name=f"testuser_{uuid.uuid4().hex[:8]}",
        first_name="Test",
        last_name="User",
        password="mocked_hash_for_testing",
        birthday=datetime.strptime("1990-01-01", "%Y-%m-%d").date(),
        phone_number="1234567890",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user):
    expire = datetime.now() + timedelta(minutes=15)
    to_encode = {"sub": test_user.email, "exp": expire}
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def live_server():
    """Spins up a real Uvicorn server in a background task for Socket.IO testing."""
    from app.main import sio_app

    config = uvicorn.Config(sio_app, host="127.0.0.1", port=8088, log_level="error")
    server = uvicorn.Server(config)

    # Prevent Uvicorn from crashing over signal handlers in a background asyncio task
    server.install_signal_handlers = lambda: None

    task = asyncio.create_task(server.serve())

    # Wait until the server is fully started before yielding
    started = False
    for _ in range(50):
        if task.done():
            exc = task.exception()
            if exc:
                raise exc
            break
        try:
            async with httpx.AsyncClient() as client:
                await client.get("http://127.0.0.1:8088/")
            started = True
            break
        except Exception:
            await asyncio.sleep(0.1)

    if not started:
        raise RuntimeError(
            "Uvicorn test server failed to start within the timeout period"
        )

    yield "http://127.0.0.1:8088"
    server.should_exit = True
    await task
