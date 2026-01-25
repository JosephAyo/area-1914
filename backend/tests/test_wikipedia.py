import pytest
import respx
from httpx import Response
from datetime import date
from app.services.wikipedia import wikipedia_service

@respx.mock
@pytest.mark.asyncio
async def test_get_page_summary_success():
    slug = "Test_Slug"
    url = f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}"

    expected_data = {
        "title": "Test Title",
        "displaytitle": "Test Title",
        "description": "A test description",
        "thumbnail": {"source": "http://example.com/image.jpg"},
        "originalimage": {"source": "http://example.com/original.jpg"},
        "extract": "Some content."
    }

    respx.get(url).mock(return_value=Response(200, json=expected_data))

    result = await wikipedia_service.get_page_summary(slug)

    assert result is not None
    assert result["title"] == "Test Title"
    assert result["thumbnail_url"] == "http://example.com/image.jpg"

@respx.mock
@pytest.mark.asyncio
async def test_get_page_summary_404():
    slug = "Missing_Slug"
    url = f"{wikipedia_service.BASE_URL_SUMMARY}/{slug}"

    respx.get(url).mock(return_value=Response(404))

    result = await wikipedia_service.get_page_summary(slug)
    assert result is None

@respx.mock
@pytest.mark.asyncio
async def test_get_pageviews_success():
    slug = "Test_Slug"
    start = date(2023, 1, 1)
    end = date(2023, 1, 2)
    start_str = start.strftime("%Y%m%d")
    end_str = end.strftime("%Y%m%d")

    url = f"{wikipedia_service.BASE_URL_PAGEVIEWS}/en.wikipedia.org/all-access/user/{slug}/daily/{start_str}/{end_str}"

    mock_response = {
        "items": [
            {"timestamp": "2023010100", "views": 100},
            {"timestamp": "2023010200", "views": 150}
        ]
    }

    respx.get(url).mock(return_value=Response(200, json=mock_response))

    results = await wikipedia_service.get_pageviews(slug, start, end)

    assert len(results) == 2
    assert results[0]["date"] == start
    assert results[0]["views"] == 100
    assert results[1]["date"] == end
    assert results[1]["views"] == 150
