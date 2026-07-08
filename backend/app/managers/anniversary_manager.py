from datetime import date, timedelta
from typing import List

from sqlmodel import Session, select

from app.models import OnThisDayTopic, WikiPageview, WikiTopic


class AnniversaryManager:
    ANNIVERSARY_YEARS = (1, 5, 10)
    BASELINE_WINDOW_DAYS = 14
    MIN_VIEWS = 50
    MIN_LIFT_SCORE = 1.35

    def __init__(self, session: Session):
        self.session = session

    def get_on_this_day(
        self,
        target_date: date | None = None,
        limit: int = 5,
    ) -> List[OnThisDayTopic]:
        target_date = target_date or date.today()
        anniversary_dates: dict[date, int] = {}

        for years_ago in self.ANNIVERSARY_YEARS:
            try:
                anniversary_date = date(
                    target_date.year - years_ago,
                    target_date.month,
                    target_date.day,
                )
            except ValueError:
                continue
            anniversary_dates[anniversary_date] = years_ago

        if not anniversary_dates:
            return []

        anniversary_pageviews_statement = (
            select(WikiPageview, WikiTopic)
            .join(WikiTopic, WikiPageview.topic_id == WikiTopic.id)
            .where(WikiPageview.date.in_(anniversary_dates.keys()))
        )

        best_by_topic: dict[str, OnThisDayTopic] = {}

        for pageview, topic in self.session.exec(anniversary_pageviews_statement).all():
            if pageview.views < self.MIN_VIEWS:
                continue

            baseline_views = self._get_baseline_views(
                topic_id=topic.id,
                anniversary_date=pageview.date,
            )
            if baseline_views <= 0:
                continue

            lift_score = pageview.views / baseline_views
            if lift_score < self.MIN_LIFT_SCORE:
                continue

            candidate = OnThisDayTopic(
                slug=topic.slug,
                title=topic.title,
                description=topic.description,
                thumbnail_url=topic.thumbnail_url,
                date=pageview.date,
                years_ago=anniversary_dates[pageview.date],
                views=pageview.views,
                baseline_views=round(baseline_views, 1),
                lift_score=round(lift_score, 2),
            )

            topic_key = self._topic_key(topic)
            existing = best_by_topic.get(topic_key)
            if not existing or self._sort_key(candidate) > self._sort_key(existing):
                best_by_topic[topic_key] = candidate

        results = sorted(
            best_by_topic.values(),
            key=self._sort_key,
            reverse=True,
        )

        return results[:limit]

    def _get_baseline_views(self, topic_id: int | None, anniversary_date: date) -> float:
        if topic_id is None:
            return 0.0

        start_date = anniversary_date - timedelta(days=self.BASELINE_WINDOW_DAYS)
        end_date = anniversary_date + timedelta(days=self.BASELINE_WINDOW_DAYS)

        statement = select(WikiPageview).where(
            WikiPageview.topic_id == topic_id,
            WikiPageview.date >= start_date,
            WikiPageview.date <= end_date,
            WikiPageview.date != anniversary_date,
        )

        pageviews = self.session.exec(statement).all()
        if not pageviews:
            return 0.0

        return sum(pageview.views for pageview in pageviews) / len(pageviews)

    @staticmethod
    def _sort_key(topic: OnThisDayTopic) -> tuple[float, int]:
        return (topic.lift_score, topic.views)

    @staticmethod
    def _topic_key(topic: WikiTopic) -> str:
        return (topic.title or topic.slug).strip().replace(" ", "_").lower()
