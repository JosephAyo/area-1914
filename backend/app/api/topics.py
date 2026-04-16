from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
import asyncio
from datetime import date, timedelta

from app.database import get_session
from app.managers import TopicManager
from app.models import WikiTopic, WikiTopicPublic

router = APIRouter()

class BatchTopicRequest(BaseModel):
    slugs: List[str]

@router.get("/topics/{slug}", response_model=WikiTopicPublic)
async def get_topic(slug: str, session: Session = Depends(get_session)):
    manager = TopicManager(session)
    topic = await manager.get_topic_with_history(slug)

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found on Wikipedia")

    return topic

@router.post("/topics/batch", response_model=List[WikiTopicPublic])
async def get_topics_batch(request: BatchTopicRequest, session: Session = Depends(get_session)):
    manager = TopicManager(session)

    # Fetch topics concurrently
    tasks = [manager.get_topic_with_history(slug) for slug in request.slugs]
    topics_results = await asyncio.gather(*tasks, return_exceptions=True)

    valid_topics = []
    for result in topics_results:
        # Ignore exceptions or not found topics
        if isinstance(result, WikiTopic) and result is not None:
            valid_topics.append(result)

    # For batch, we want to limit the payload by only returning 30 days of pageviews
    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    response_list = []
    for t in valid_topics:
        # Filter pageviews in-memory to avoid extra DB hits
        recent_views = [pv for pv in t.pageviews if pv.date >= start_date]
        recent_views.sort(key=lambda x: x.date)

        t_public = WikiTopicPublic(
            id=t.id,
            title=t.title,
            slug=t.slug,
            description=t.description,
            thumbnail_url=t.thumbnail_url,
            last_fetched_at=t.last_fetched_at,
            pageviews=recent_views
        )
        response_list.append(t_public)

    return response_list
