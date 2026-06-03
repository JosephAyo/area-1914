import httpx
import asyncio
from datetime import date, datetime
from typing import Optional, Dict, Any, List
from app.settings import settings
import logging

# Configure logger
logger = logging.getLogger(__name__)

class WikipediaService:
    BASE_URL_PAGEVIEWS = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article"
    BASE_URL_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary"
    BASE_URL_ACTION_API = "https://en.wikipedia.org/w/api.php"

    def __init__(self):
        self.headers = {
            "User-Agent": settings.WIKIMEDIA_USER_AGENT
        }

    async def _request(self, url: str) -> Optional[Any]:
        """
        Internal helper to make requests with retry logic for rate limiting (429).
        """
        max_retries = 3
        backoff_factor = 1.0

        async with httpx.AsyncClient(headers=self.headers) as client:
            for attempt in range(max_retries):
                try:
                    response = await client.get(url)

                    if response.status_code == 200:
                        return response.json()

                    if response.status_code == 404:
                        logger.warning(f"Wikipedia page not found: {url}")
                        return None

                    if response.status_code == 429:
                        # Rate limited
                        retry_after = int(response.headers.get("Retry-After", backoff_factor * (2 ** attempt)))
                        logger.warning(f"Rate limited. Retrying in {retry_after}s...")
                        await asyncio.sleep(retry_after)
                        continue

                    # Other errors
                    response.raise_for_status()

                except httpx.RequestError as e:
                    logger.error(f"Request error for {url}: {e}")
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(backoff_factor * (2 ** attempt))

        return None

    async def get_page_summary(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Fetches metadata (title, description, thumbnail) for a given article slug.
        """
        url = f"{self.BASE_URL_SUMMARY}/{slug}"
        data = await self._request(url)

        if not data:
            return None

        return {
            "title": data.get("title"),
            "displaytitle": data.get("displaytitle"),
            "description": data.get("description"),
            "thumbnail_url": data.get("thumbnail", {}).get("source"),
            "originalimage_url": data.get("originalimage", {}).get("source"),
            "extract": data.get("extract")
        }

    async def get_pageviews(self, slug: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """
        Fetches daily pageviews for a given article slug between start and end dates.
        """
        # Format dates as YYYYMMDD
        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")

        # Construct URL
        # en.wikipedia.org / all-access / user / {slug} / daily / {start} / {end}
        url = (
            f"{self.BASE_URL_PAGEVIEWS}/en.wikipedia.org/all-access/user/"
            f"{slug}/daily/{start_str}/{end_str}"
        )

        data = await self._request(url)

        if not data or "items" not in data:
            return []

        results = []
        for item in data["items"]:
            # Parse the date string "YYYYMMDD00" -> Date object
            # The API returns timestamp as string like "2015100100"
            timestamp_str = item.get("timestamp", "")
            if len(timestamp_str) >= 8:
                date_part = timestamp_str[:8]
                parsed_date = datetime.strptime(date_part, "%Y%m%d").date()
                results.append({
                    "date": parsed_date,
                    "views": item.get("views", 0)
                })

        return results

    async def get_article_wikitext(self, title: str) -> Optional[str]:
        """
        Fetches the raw wikitext of an article using the MediaWiki Action API.
        """
        url = (
            f"{self.BASE_URL_ACTION_API}?action=query&prop=revisions&"
            f"titles={title}&rvslots=*&rvprop=content&format=json"
        )
        data = await self._request(url)

        if not data or "query" not in data or "pages" not in data["query"]:
            return None

        pages = data["query"]["pages"]
        # The pages dict is keyed by pageid.
        for page_id, page_data in pages.items():
            if page_id == "-1":
                return None  # Page not found

            revisions = page_data.get("revisions", [])
            if revisions and "slots" in revisions[0] and "main" in revisions[0]["slots"]:
                return revisions[0]["slots"]["main"].get("*")

        return None

    async def search_articles(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Searches Wikipedia and returns matching titles with thumbnails.
        """
        url = (
            f"{self.BASE_URL_ACTION_API}?action=query&generator=search"
            f"&gsrsearch={query}&gsrlimit={limit}&prop=pageimages"
            f"&piprop=thumbnail&pithumbsize=50&format=json"
        )

        data = await self._request(url)

        if not data or "query" not in data or "pages" not in data["query"]:
            return []

        pages = data["query"]["pages"].values()
        results = sorted(pages, key=lambda p: p.get("index", 999))
        return [
            {
                "title": p["title"],
                "thumbnail": p.get("thumbnail", {}).get("source"),
            }
            for p in results
        ]

    async def get_page_categories(self, title: str, limit: int = 50) -> List[str]:
        """
        Fetches category names for a given Wikipedia article.
        Returns a list of category strings (without the 'Category:' prefix).
        """
        url = (
            f"{self.BASE_URL_ACTION_API}?action=query&prop=categories"
            f"&titles={title}&cllimit={limit}&format=json&redirects=1"
        )
        data = await self._request(url)

        if not data or "query" not in data or "pages" not in data["query"]:
            return []

        categories: List[str] = []
        pages = data["query"]["pages"]
        for page_id, page_data in pages.items():
            if page_id == "-1":
                return []
            for cat in page_data.get("categories", []):
                # Category titles come as "Category:Nigerian musicians"
                cat_title = cat.get("title", "")
                if cat_title.startswith("Category:"):
                    cat_title = cat_title[len("Category:"):]
                categories.append(cat_title)

        return categories

# Singleton instance
wikipedia_service = WikipediaService()
