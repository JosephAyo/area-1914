import random
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from datetime import date, timedelta
from pydantic import BaseModel

from app.database import get_session
from app.managers import TopicManager
from app.models import WikiTopicPublic
from app.config.curated_topics import CURATED_CATEGORIES

import logging

router = APIRouter()


class FeaturedCategory(BaseModel):
    name: str
    icon: str
    topics: List[WikiTopicPublic]


@router.get("/topics/featured", response_model=List[FeaturedCategory])
async def get_featured_topics(session: Session = Depends(get_session)):
    manager = TopicManager(session)

    # Fetch all unique slugs in one pass
    all_slugs = list({slug for cat in CURATED_CATEGORIES for slug in cat.slugs})
    topics_by_slug: dict[str, WikiTopicPublic] = {}

    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    for slug in all_slugs:
        try:
            topic = await manager.get_topic_with_history(slug)
            if not topic:
                continue
            recent_views = sorted(
                [pv for pv in topic.pageviews if pv.date >= start_date],
                key=lambda x: x.date,
            )
            topics_by_slug[slug] = WikiTopicPublic(
                id=topic.id,
                title=topic.title,
                slug=topic.slug,
                description=topic.description,
                thumbnail_url=topic.thumbnail_url,
                last_fetched_at=topic.last_fetched_at,
                pageviews=recent_views,
            )
        except Exception:
            logging.exception(f"Error fetching featured topic '{slug}'")

    result = []
    for cat in CURATED_CATEGORIES:
        slugs = cat.slugs[:]
        if cat.randomize:
            random.shuffle(slugs)
        topics = [topics_by_slug[s] for s in slugs if s in topics_by_slug]
        if topics:
            result.append(FeaturedCategory(name=cat.name, icon=cat.icon, topics=topics))

    return result
