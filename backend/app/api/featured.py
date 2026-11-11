import random
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from datetime import date, timedelta
from pydantic import BaseModel

from app.database import get_session
from app.managers import TopicManager
from app.models import WikiPageviewBase, WikiTopicPublic
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
    # The explorer compares two complete 30-day windows. Keep both periods
    # in this lightweight response instead of making a full-history request
    # for every visible subject.
    start_date = end_date - timedelta(days=60)

    for slug in all_slugs:
        try:
            topic = await manager.get_topic_with_history(slug)
            if not topic or topic.id is None:
                continue
            recent_views = sorted(
                [
                    WikiPageviewBase(date=pv.date, views=pv.views)
                    for pv in topic.pageviews
                    if start_date <= pv.date <= end_date
                ],
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
