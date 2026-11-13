import pytest
import respx
import httpx

from app.services.wikipedia import WikipediaService


@pytest.mark.asyncio
@respx.mock
async def test_confirmed_missing_summary_is_cached_only_until_expiry(monkeypatch):
    service = WikipediaService()
    clock = [100.0]
    monkeypatch.setattr("app.services.wikipedia.monotonic", lambda: clock[0])
    route = respx.get(f"{service.BASE_URL_SUMMARY}/Missing_Slug").mock(side_effect=[
        httpx.Response(404), httpx.Response(200, json={"title": "Now available"}),
    ])
    assert await service.get_page_summary("Missing_Slug") is None
    assert await service.get_page_summary("Missing_Slug") is None
    assert route.call_count == 1
    clock[0] += service.MISSING_SUMMARY_TTL_SECONDS
    recovered = await service.get_page_summary("Missing_Slug")
    assert recovered is not None
    assert recovered["title"] == "Now available"
    assert route.call_count == 2


@pytest.mark.asyncio
@respx.mock
async def test_pageview_not_found_and_server_errors_remain_retryable():
    service = WikipediaService()
    views_url = f"{service.BASE_URL_PAGEVIEWS}/test"
    missing_views = respx.get(views_url).mock(return_value=httpx.Response(404))
    assert await service._request(views_url) is None
    assert await service._request(views_url) is None
    assert missing_views.call_count == 2
    summary = respx.get(f"{service.BASE_URL_SUMMARY}/Temporary_Failure").mock(side_effect=[
        httpx.Response(503), httpx.Response(200, json={"title": "Recovered"}),
    ])
    with pytest.raises(httpx.HTTPStatusError):
        await service.get_page_summary("Temporary_Failure")
    recovered = await service.get_page_summary("Temporary_Failure")
    assert recovered is not None
    assert recovered["title"] == "Recovered"
    assert summary.call_count == 2


@pytest.mark.asyncio
@respx.mock
async def test_exhausted_rate_limits_are_not_cached_as_missing():
    service = WikipediaService()
    route = respx.get(f"{service.BASE_URL_SUMMARY}/Rate_Limited").mock(side_effect=[
        *[httpx.Response(429, headers={"Retry-After": "0"}) for _ in range(3)],
        httpx.Response(200, json={"title": "Recovered"}),
    ])
    assert await service.get_page_summary("Rate_Limited") is None
    assert not service._missing_summaries
    recovered = await service.get_page_summary("Rate_Limited")
    assert recovered is not None
    assert recovered["title"] == "Recovered"
    assert route.call_count == 4


@pytest.mark.asyncio
@respx.mock
async def test_missing_summary_cache_is_bounded_and_does_not_hide_other_pages():
    service = WikipediaService()
    service.MAX_MISSING_SUMMARIES = 2
    for slug in ["First", "Second", "Third"]:
        respx.get(f"{service.BASE_URL_SUMMARY}/{slug}").mock(return_value=httpx.Response(404))
        assert await service.get_page_summary(slug) is None
    assert len(service._missing_summaries) == 2
    assert f"{service.BASE_URL_SUMMARY}/First" not in service._missing_summaries
    available = respx.get(f"{service.BASE_URL_SUMMARY}/Available").mock(return_value=httpx.Response(200, json={"title": "Available"}))
    result = await service.get_page_summary("Available")
    assert result is not None
    assert result["title"] == "Available"
    assert available.call_count == 1
