import pytest
import pytest_asyncio
from sqlmodel import SQLModel, create_engine, Session
from app.main import app
from app.database import get_session
from httpx import AsyncClient, ASGITransport

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        TEST_DATABASE_URL, 
        connect_args={"check_same_thread": False}, 
        poolclass=None
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest_asyncio.fixture(name="client")
async def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    
    # httpx >= 0.28.0 deprecates `app=app`, uses transport instead
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()
