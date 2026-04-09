from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import create_db_and_tables
from app.settings import settings
# Import models to ensure they are registered with SQLModel.metadata
from app.models import WikiTopic, WikiPageview
from app.api import topics, trending, citations, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    create_db_and_tables()
    yield
    # Shutdown: Clean up if necessary

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics.router, prefix="/api")
app.include_router(trending.router, prefix="/api")
app.include_router(citations.router, prefix="/api")
app.include_router(search.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to The Nigerian History Pulse API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
