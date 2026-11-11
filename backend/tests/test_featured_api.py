from datetime import date, datetime, timedelta, timezone

import pytest

from app.api import featured
from app.config.curated_topics import CuratedCategory
from app.models import WikiPageview, WikiTopic


@pytest.mark.asyncio
async def test_featured_includes_both_comparison_windows_without_future_records(client, monkeypatch):
    today = date.today()
    topic = WikiTopic(
        id=1,
        slug="Fela_Kuti",
        title="Fela Kuti",
        description="Nigerian musician",
        pageviews=[
            WikiPageview(date=today - timedelta(days=offset), views=100)
            for offset in range(-1, 72)
        ],
    )

    class CachedManager:
        def __init__(self, session):
            pass

        async def get_topic_with_history(self, slug):
            return topic

    monkeypatch.setattr(featured, "TopicManager", CachedManager)
    monkeypatch.setattr(featured, "CURATED_CATEGORIES", [CuratedCategory("Arts & Culture", "", ["Fela_Kuti"])])

    response = await client.get("/api/topics/featured")

    assert response.status_code == 200
    entries = response.json()[0]["topics"][0]["pageviews"]
    dates = [entry["date"] for entry in entries]
    assert dates[0] == (today - timedelta(days=60)).isoformat()
    assert dates[-1] == today.isoformat()
    assert len(entries) == 61
    assert (today - timedelta(days=45)).isoformat() in dates
    assert (today + timedelta(days=1)).isoformat() not in dates


@pytest.mark.asyncio
async def test_featured_reads_fresh_sqlite_cache_with_two_complete_periods(client, session, monkeypatch):
    today = date.today()
    topic = WikiTopic(
        slug="Fela_Kuti",
        title="Fela Kuti",
        last_fetched_at=datetime.now(timezone.utc),
        pageviews=[
            WikiPageview(date=today - timedelta(days=offset), views=100)
            for offset in range(1, 61)
        ],
    )
    session.add(topic)
    session.commit()
    monkeypatch.setattr(featured, "CURATED_CATEGORIES", [CuratedCategory("Arts & Culture", "", ["Fela_Kuti"])])

    response = await client.get("/api/topics/featured")

    assert response.status_code == 200
    subjects = response.json()[0]["topics"]
    assert subjects[0]["title"] == "Fela Kuti"
    assert len(subjects[0]["pageviews"]) == 60
    assert sum(entry["views"] for entry in subjects[0]["pageviews"]) == 6000
