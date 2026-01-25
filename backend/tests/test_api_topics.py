import pytest
import respx
from httpx import AsyncClient, Response
from app.services.wikipedia import wikipedia_service

@respx.mock
@pytest.mark.asyncio
async def test_api_get_topic_creates_new(client: AsyncClient):
    slug = "API_Test_Slug"
    # Mock external API
    respx.get(f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}").mock(
        return_value=Response(200, json={
            "title": "API Title",
            "description": "API Desc"
        })
    )
    respx.get(url__startswith=wikipedia_service.BASE_URL_PAGEVIEWS).mock(
        return_value=Response(200, json={"items": []})
    )

    response = await client.get(f"/api/topics/{slug}")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == slug
    assert data["title"] == "API Title"

@respx.mock
@pytest.mark.asyncio
async def test_api_get_topic_404(client: AsyncClient):
    slug = "Invalid_Slug"
    # Mock external API to return 404 (Wikipedia doesn't have it)
    respx.get(f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}").mock(
        return_value=Response(404)
    )
    respx.get(url__startswith=wikipedia_service.BASE_URL_PAGEVIEWS).mock(
        return_value=Response(200, json={"items": []})
    )

    response = await client.get(f"/api/topics/{slug}")

    # Our API returns 404 if Wikipedia returns 404/None
    assert response.status_code == 404
