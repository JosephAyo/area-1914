from sqlmodel import SQLModel, create_engine, Session
from app.settings import settings

# check_same_thread=False is needed for SQLite to work with FastAPI's multithreading
connect_args = {"check_same_thread": False}
engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
