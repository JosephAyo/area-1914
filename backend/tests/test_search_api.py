import pytest
import respx
from httpx import AsyncClient, Response
from app.services.wikipedia import wikipedia_service

@respx.mock
@pytest.mark.asyncio
async def test_search_api(client: AsyncClient):
    query = "lagos"

    mock_response = {
        "query": {
            "pages": {
                "1": {
                    "index": 1,
                    "title": "Lagos",
                    "thumbnail": {"source": "https://example.com/lagos.jpg"},
                },
                "2": {
                    "index": 2,
                    "title": "Lagos State",
                },
                "3": {
                    "index": 3,
                    "title": "Lagos Island",
                },
            }
        }
    }

    respx.get(url__startswith=wikipedia_service.BASE_URL_ACTION_API).mock(
        return_value=Response(200, json=mock_response)
    )

    response = await client.get(f"/api/search?q={query}")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 3
    assert data[0] == {
        "title": "Lagos",
        "thumbnail": "https://example.com/lagos.jpg",
    }
    assert data[1] == {
        "title": "Lagos State",
        "thumbnail": None,
    }

@respx.mock
@pytest.mark.asyncio
async def test_search_api_empty(client: AsyncClient):
    response = await client.get(f"/api/search?q=  ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
