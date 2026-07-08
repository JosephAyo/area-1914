import pytest
import respx
from httpx import AsyncClient, Response

from app.services.wikipedia import wikipedia_service


def mock_empty_relationship_apis():
    respx.get(url__startswith=wikipedia_service.BASE_URL_ACTION_API).mock(
        return_value=Response(
            200,
            json={
                "query": {
                    "pages": {"123": {"links": [], "categories": []}},
                    "backlinks": [],
                    "categorymembers": [],
                }
            },
        )
    )


@respx.mock
@pytest.mark.asyncio
async def test_related_topics_api_returns_curated_connections(client: AsyncClient):
    mock_empty_relationship_apis()
    respx.get(url__startswith=wikipedia_service.BASE_URL_SUMMARY).mock(
        side_effect=[
            Response(
                200,
                json={
                    "title": "Yakubu Gowon",
                    "description": "Military head of state of Nigeria",
                    "thumbnail": {"source": "https://example.com/gowon.jpg"},
                },
            ),
            Response(
                200,
                json={
                    "title": "Murtala Muhammed",
                    "description": "Military head of state of Nigeria",
                },
            ),
        ]
    )

    response = await client.get("/api/topics/Aguiyi_Ironsi/related?limit=2")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0] == {
        "slug": "Yakubu_Gowon",
        "title": "Yakubu Gowon",
        "description": "Military head of state of Nigeria",
        "thumbnail_url": "https://example.com/gowon.jpg",
        "connection": "Military Leaders",
    }
    assert data[1]["slug"] == "Murtala_Muhammed"
    assert data[1]["connection"] == "Military Leaders"


@respx.mock
@pytest.mark.asyncio
async def test_related_topics_api_uses_wikipedia_relationships(client: AsyncClient):
    def action_api_response(request):
        params = request.url.params
        if params.get("prop") == "links":
            return Response(
                200,
                json={
                    "query": {
                        "pages": {
                            "123": {
                                "links": [
                                    {"title": "Muhammadu Buhari"},
                                ]
                            }
                        }
                    }
                },
            )
        if params.get("list") == "backlinks":
            return Response(
                200,
                json={
                    "query": {
                        "backlinks": [
                            {"title": "Nigerian Civil War"},
                        ]
                    }
                },
            )
        if params.get("prop") == "categories":
            return Response(
                200,
                json={
                    "query": {
                        "pages": {
                            "123": {
                                "categories": [
                                    {"title": "Category:Politics of Nigeria"},
                                ]
                            }
                        }
                    }
                },
            )
        if params.get("list") == "categorymembers":
            return Response(
                200,
                json={
                    "query": {
                        "categorymembers": [
                            {"title": "Lagos"},
                        ]
                    }
                },
            )
        return Response(500)

    respx.get(url__startswith=wikipedia_service.BASE_URL_ACTION_API).mock(
        side_effect=action_api_response
    )
    respx.get(url__startswith=wikipedia_service.BASE_URL_SUMMARY).mock(
        side_effect=[
            Response(
                200,
                json={
                    "title": "Lagos",
                    "description": "Most populous city in Nigeria",
                },
            ),
            Response(
                200,
                json={
                    "title": "Muhammadu Buhari",
                    "description": "President of Nigeria from 2015 to 2023",
                },
            ),
            Response(
                200,
                json={
                    "title": "Nigerian Civil War",
                    "description": "Civil war in Nigeria from 1967 to 1970",
                },
            ),
        ]
    )

    response = await client.get("/api/topics/Some_Nigerian_topic/related?limit=3")

    assert response.status_code == 200
    data = response.json()
    assert [item["slug"] for item in data] == [
        "Lagos",
        "Muhammadu_Buhari",
        "Nigerian_Civil_War",
    ]
    assert data[0]["connection"] == "Shared category: Politics of Nigeria"
    assert data[1]["connection"] == "Linked from article"
    assert data[2]["connection"] == "Links to this article"


@respx.mock
@pytest.mark.asyncio
async def test_related_topics_api_returns_empty_for_unknown_topic(client: AsyncClient):
    mock_empty_relationship_apis()
    response = await client.get("/api/topics/Unknown_Topic/related")

    assert response.status_code == 200
    assert response.json() == []
