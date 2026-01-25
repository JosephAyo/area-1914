import pytest
import respx
from httpx import Response
from datetime import date, datetime, timedelta
from sqlmodel import Session, select
from app.managers.topic_manager import TopicManager
from app.models import WikiTopic, WikiPageview
from app.services.wikipedia import wikipedia_service

# Mock data helper
def mock_wiki_api(slug: str):
    # Summary
    respx.get(f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}").mock(
        return_value=Response(200, json={
            "title": slug,
            "displaytitle": slug,
            "description": "Desc",
            "thumbnail": {"source": "img.jpg"}
        })
    )
    # Pageviews (Catch-all for simple testing)
    respx.get(url__startswith=wikipedia_service.BASE_URL_PAGEVIEWS).mock(
        return_value=Response(200, json={"items": []})
    )

@respx.mock
@pytest.mark.asyncio
async def test_create_new_topic(session: Session):
    slug = "New_Topic"
    mock_wiki_api(slug)
    
    manager = TopicManager(session)
    topic = await manager.get_topic_with_history(slug)
    
    assert topic is not None
    assert topic.slug == slug
    assert topic.id is not None
    # Should be freshly fetched
    assert topic.last_fetched_at is not None

@respx.mock
@pytest.mark.asyncio
async def test_get_existing_fresh_topic(session: Session):
    slug = "Existing_Topic"
    
    # Manually create topic in DB
    topic = WikiTopic(
        slug=slug, 
        title="Title", 
        last_fetched_at=datetime.utcnow()
    )
    session.add(topic)
    session.commit()
    
    manager = TopicManager(session)
    
    # API should NOT be called because it is fresh
    # We enforce this by NOT mocking the API. If it calls, it will fail (or we can assert calls).
    # Respx by default asserts all mocked routes are called? No.
    # But if it tries to hit real network it fails in test environment usually.
    # Let's mock it to fail if called to be sure.
    
    respx.get(f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}").mock(return_value=Response(500))
    
    result = await manager.get_topic_with_history(slug)
    assert result.id == topic.id

@respx.mock
@pytest.mark.asyncio
async def test_update_stale_topic(session: Session):
    slug = "Stale_Topic"
    mock_wiki_api(slug)
    
    # Create stale topic (2 days ago)
    stale_date = datetime.utcnow() - timedelta(days=2)
    topic = WikiTopic(
        slug=slug, 
        title="Old Title", 
        last_fetched_at=stale_date
    )
    session.add(topic)
    session.commit()
    
    manager = TopicManager(session)
    updated_topic = await manager.get_topic_with_history(slug)
    
    assert updated_topic.last_fetched_at > stale_date
