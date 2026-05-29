from datetime import date, timedelta
from typing import List
from sqlmodel import Session, select
from app.models import WikiTopic, WikiPageview, TrendingArticle
from app.managers.topic_manager import TopicManager
from app.services.wikipedia import wikipedia_service
import asyncio
import logging

logger = logging.getLogger(__name__)

class TrendingManager:
    def __init__(self, session: Session):
        self.session = session
        self.topic_manager = TopicManager(session)

    async def get_trending(self, limit: int = 10, period_days: int = 30) -> List[TrendingArticle]:
        """
        Calculates trending articles by comparing pageviews from the recent
        period to the previous period.
        """
        # Get all topics
        statement = select(WikiTopic)
        topics = self.session.exec(statement).all()

        end_date = date.today()
        mid_date = end_date - timedelta(days=period_days)
        start_date = mid_date - timedelta(days=period_days)

        results = []

        # Process sequentially
        for topic in topics:
            # First, check if topic data needs a refresh (using topic_manager logic)
            # This ensures pageviews are up to date.
            try:
                await self.topic_manager.get_topic_with_history(topic.slug)
            except Exception as e:
                logger.error(f"Error refreshing topic {topic.slug}: {e}")
                pass # Still try to compute trend with whatever data we have

            # Re-fetch from DB to get updated pageviews
            topic_refreshed = self.session.exec(select(WikiTopic).where(WikiTopic.slug == topic.slug)).first()
            if not topic_refreshed:
                continue

            current_views = 0
            previous_views = 0

            # Calculate views for the periods
            # Alternatively, query from DB:
            statement_current = select(WikiPageview).where(
                WikiPageview.topic_id == topic_refreshed.id,
                WikiPageview.date > mid_date,
                WikiPageview.date <= end_date
            )

            statement_prev = select(WikiPageview).where(
                WikiPageview.topic_id == topic_refreshed.id,
                WikiPageview.date > start_date,
                WikiPageview.date <= mid_date
            )

            current_records = self.session.exec(statement_current).all()
            prev_records = self.session.exec(statement_prev).all()

            current_views = sum(record.views for record in current_records)
            previous_views = sum(record.views for record in prev_records)

            if current_views == 0 and previous_views == 0:
                 # No views, no trend
                 continue

            # Prevent small jumps (e.g. 0 to 1 view) from creating a 100% spike
            # by establishing a baseline denominator for trending calculations.
            denominator = max(previous_views, 50)
            trend_score = ((current_views - previous_views) / denominator) * 100.0

            result = TrendingArticle(
                slug=topic_refreshed.slug,
                title=topic_refreshed.title,
                description=topic_refreshed.description,
                thumbnail_url=topic_refreshed.thumbnail_url,
                current_views=current_views,
                previous_views=previous_views,
                trend_score=trend_score
            )
            results.append(result)

        # Sort by trend_score descending
        results.sort(key=lambda x: x.trend_score, reverse=True)

        return results[:limit]
