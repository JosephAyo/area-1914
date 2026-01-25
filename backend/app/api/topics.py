from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.managers import TopicManager
from app.models import WikiTopic

router = APIRouter()

@router.get("/topics/{slug}", response_model=WikiTopic)
async def get_topic(slug: str, session: Session = Depends(get_session)):
    manager = TopicManager(session)
    topic = await manager.get_topic_with_history(slug)

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found on Wikipedia")

    return topic
