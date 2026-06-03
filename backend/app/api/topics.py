from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List

from app.database import get_session
from app.managers import TopicManager
from app.models import WikiTopicPublic

router = APIRouter()

@router.get("/topics/{slug}", response_model=WikiTopicPublic)
async def get_topic(slug: str, session: Session = Depends(get_session)):
    manager = TopicManager(session)
    try:
        topic = await manager.get_topic_with_history(slug)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found on Wikipedia")

    return topic
