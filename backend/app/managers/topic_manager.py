from datetime import datetime, timedelta, date
from typing import Optional
from sqlmodel import Session, select
from app.models import WikiTopic, WikiPageview
from app.services.wikipedia import wikipedia_service
import logging

logger = logging.getLogger(__name__)

class TopicManager:
    STALE_THRESHOLD = timedelta(hours=24)
    # Default history to fetch if never fetched before (e.g. 5 years)
    DEFAULT_HISTORY_DAYS = 365 * 5 

    def __init__(self, session: Session):
        self.session = session

    async def get_topic_with_history(self, slug: str) -> Optional[WikiTopic]:
        """
        Main entry point.
        Checks DB. If missing or stale, fetches from API and updates DB.
        """
        # 1. Check DB
        statement = select(WikiTopic).where(WikiTopic.slug == slug)
        topic = self.session.exec(statement).first()

        now = datetime.utcnow()

        if topic:
            # 2. Check if stale
            if not topic.last_fetched_at or (now - topic.last_fetched_at > self.STALE_THRESHOLD):
                logger.info(f"Topic '{slug}' is stale. Updating...")
                await self._update_topic_data(topic)
            else:
                logger.info(f"Topic '{slug}' found in cache.")
        else:
            # 3. New Topic
            logger.info(f"Topic '{slug}' not found. Creating...")
            topic = await self._create_new_topic(slug)

        # Refresh local object to ensure relationships are loaded if needed
        if topic:
            self.session.refresh(topic)
            
        return topic

    async def _create_new_topic(self, slug: str) -> Optional[WikiTopic]:
        # Fetch Metadata
        summary = await wikipedia_service.get_page_summary(slug)
        if not summary:
            logger.warning(f"Could not find summary for slug: {slug}")
            return None

        topic = WikiTopic(
            slug=slug,
            title=summary.get("title", slug),
            description=summary.get("description"),
            thumbnail_url=summary.get("thumbnail_url"),
            last_fetched_at=datetime.utcnow()
        )
        self.session.add(topic)
        self.session.commit()
        self.session.refresh(topic)

        # Fetch History (Backfill)
        end_date = date.today()
        start_date = end_date - timedelta(days=self.DEFAULT_HISTORY_DAYS)
        
        await self._fetch_and_store_pageviews(topic, start_date, end_date)
        
        return topic

    async def _update_topic_data(self, topic: WikiTopic):
        # Update Metadata (in case description/image changed)
        summary = await wikipedia_service.get_page_summary(topic.slug)
        if summary:
            topic.title = summary.get("title", topic.title)
            topic.description = summary.get("description", topic.description)
            topic.thumbnail_url = summary.get("thumbnail_url", topic.thumbnail_url)

        # Calculate fetch range
        # Start from the day after the last known data point? 
        # Or just overlap a bit to be safe? 
        # For simplicity, if updating, we assume we have old data, 
        # so we fetch from (last_fetched_at.date or defaults) to today.
        
        end_date = date.today()
        
        # Determine start date based on what we have?
        # A simple query to find the max date in DB for this topic would be better,
        # but relying on `last_fetched_at` is a decent proxy for the "gap".
        start_date = topic.last_fetched_at.date() if topic.last_fetched_at else (end_date - timedelta(days=30))
        
        if start_date < end_date:
            await self._fetch_and_store_pageviews(topic, start_date, end_date)
            
        topic.last_fetched_at = datetime.utcnow()
        self.session.add(topic)
        self.session.commit()

    async def _fetch_and_store_pageviews(self, topic: WikiTopic, start_date: date, end_date: date):
        views_data = await wikipedia_service.get_pageviews(topic.slug, start_date, end_date)
        
        if not views_data:
            return

        # Optimization: We could use bulk_insert, but SQLModel is object-centric.
        # For a few thousand rows, iterating is "okay", but let's be careful.
        # We need to avoid duplicates.
        
        # Simple strategy: Delete existing range and re-insert? 
        # Or "Upsert"? SQLite supports "INSERT OR REPLACE" or "ON CONFLICT".
        # SQLModel doesn't support UPSERT natively easily without raw SQL.
        # Let's simple check: Query existing dates in this range to avoid Dupes.
        
        # Get existing dates for this topic
        statement = select(WikiPageview.date).where(
            WikiPageview.topic_id == topic.id,
            WikiPageview.date >= start_date,
            WikiPageview.date <= end_date
        )
        existing_dates_result = self.session.exec(statement).all()
        existing_dates = set(existing_dates_result)

        new_records = []
        for item in views_data:
            view_date = item["date"]
            if view_date not in existing_dates:
                # Add new record
                record = WikiPageview(
                    date=view_date,
                    views=item["views"],
                    topic_id=topic.id
                )
                new_records.append(record)
        
        if new_records:
            self.session.add_all(new_records)
            self.session.commit()
            logger.info(f"Stored {len(new_records)} new pageview records for {topic.slug}")
