import pytest
import respx
from httpx import AsyncClient, Response
from app.services.wikipedia import wikipedia_service

@respx.mock
@pytest.mark.asyncio
async def test_search_api(client: AsyncClient):
    query = "lagos"
    url = f"{wikipedia_service.BASE_URL_ACTION_API}?action=opensearch&search={query}&limit=5&format=json"

    mock_response = [
        "lagos",
        ["Lagos", "Lagos State", "Lagos Island"],
        ["", "", ""],
        ["https://en.wikipedia.org/wiki/Lagos", "https://en.wikipedia.org/wiki/Lagos_State", "https://en.wikipedia.org/wiki/Lagos_Island"]
    ]

    respx.get(url).mock(return_value=Response(200, json=mock_response))

    response = await client.get(f"/api/search?q={query}")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 3
    assert data[0] == "Lagos"
    assert data[1] == "Lagos State"

@respx.mock
@pytest.mark.asyncio
async def test_search_api_empty(client: AsyncClient):
    response = await client.get(f"/api/search?q=  ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
