import pytest
import respx
from httpx import AsyncClient, Response
from app.services.wikipedia import wikipedia_service

@respx.mock
@pytest.mark.asyncio
async def test_citations_api(client: AsyncClient):
    slug = "Test_Citations"

    wikitext = """
    {{cite news|newspaper=The Punch|title=Headline}}
    {{cite news|newspaper=The Punch|title=Another}}
    {{cite journal|journal=Nature}}
    """

    # Mock the action API
    respx.get(url__startswith=wikipedia_service.BASE_URL_ACTION_API).mock(
        return_value=Response(200, json={
            "query": {
                "pages": {
                    "123": {
                        "revisions": [
                            {"slots": {"main": {"*": wikitext}}}
                        ]
                    }
                }
            }
        })
    )

    response = await client.get(f"/api/topics/{slug}/sources")
    assert response.status_code == 200

    data = response.json()
    assert data["slug"] == slug
    assert data["total_citations"] == 3
    assert data["category_breakdown"]["newspaper"] == 2
    assert data["category_breakdown"]["journal"] == 1

    # The Punch should be top source
    assert "The Punch" in data["top_sources"]
