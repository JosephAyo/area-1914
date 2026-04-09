import pytest
import respx
from httpx import AsyncClient, Response
from datetime import datetime, date, timedelta
from sqlmodel import Session
from app.models import WikiTopic, WikiPageview
from app.services.wikipedia import wikipedia_service

@pytest.fixture
def seed_trending_data(session: Session):
    # Seed 2 topics
    topic1 = WikiTopic(slug="Trend_Up", title="Trend Up", last_fetched_at=datetime.utcnow())
    topic2 = WikiTopic(slug="Trend_Down", title="Trend Down", last_fetched_at=datetime.utcnow())
    session.add_all([topic1, topic2])
    session.commit()

    end_date = date.today()
    mid_date = end_date - timedelta(days=30)
    start_date = mid_date - timedelta(days=30)

    # For topic1 (Trend Up), previous views: 100, current views: 200 (+100%)
    session.add(WikiPageview(topic_id=topic1.id, date=start_date + timedelta(days=1), views=100))
    session.add(WikiPageview(topic_id=topic1.id, date=mid_date + timedelta(days=1), views=200))

    # For topic2 (Trend Down), previous views: 200, current views: 100 (-50%)
    session.add(WikiPageview(topic_id=topic2.id, date=start_date + timedelta(days=1), views=200))
    session.add(WikiPageview(topic_id=topic2.id, date=mid_date + timedelta(days=1), views=100))

    session.commit()

@respx.mock
@pytest.mark.asyncio
async def test_trending_api(client: AsyncClient, seed_trending_data):
    # Mock wikipedia service call inside get_topic_with_history so it doesn't fail/hang
    respx.get(url__startswith=wikipedia_service.BASE_URL_SUMMARY).mock(
        return_value=Response(500) # Ensure no network calls succeed, relying on DB
    )

    response = await client.get("/api/trending")
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 2

    # Trend_Up should be first because +100% > -50%
    assert data[0]["slug"] == "Trend_Up"
    assert data[0]["trend_score"] == 100.0
    assert data[0]["current_views"] == 200
    assert data[0]["previous_views"] == 100

    assert data[1]["slug"] == "Trend_Down"
    assert data[1]["trend_score"] == -50.0
    assert data[1]["current_views"] == 100
    assert data[1]["previous_views"] == 200

@respx.mock
@pytest.mark.asyncio
async def test_trending_api_limit(client: AsyncClient, seed_trending_data):
    respx.get(url__startswith=wikipedia_service.BASE_URL_SUMMARY).mock(
        return_value=Response(500)
    )

    response = await client.get("/api/trending?limit=1")
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["slug"] == "Trend_Up"
