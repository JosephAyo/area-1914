from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import create_db_and_tables
from app.settings import settings
# Import models to ensure they are registered with SQLModel.metadata
from app.models import WikiTopic, WikiPageview

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    create_db_and_tables()
    yield
    # Shutdown: Clean up if necessary

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"message": "Welcome to The Nigerian History Pulse API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
