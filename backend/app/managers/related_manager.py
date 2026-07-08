import asyncio
from collections import defaultdict
from typing import List

from app.config.curated_topics import CURATED_CATEGORIES
from app.models import RelatedTopic
from app.services.relevance import _text_matches_keywords
from app.services.wikipedia import wikipedia_service


def _normalize_slug(slug: str) -> str:
    return slug.strip().replace(" ", "_").lower()


def _title_to_slug(title: str) -> str:
    return title.strip().replace(" ", "_")


def _is_useful_category(category: str) -> bool:
    category_lower = category.lower()
    ignored_terms = [
        "births",
        "deaths",
        "living people",
        "articles",
        "cs1",
        "short description",
        "webarchive",
        "wikidata",
        "use dmy dates",
        "commons category",
    ]
    return _text_matches_keywords(category) and not any(
        term in category_lower for term in ignored_terms
    )


class RelatedTopicManager:
    async def get_related_topics(self, slug: str, limit: int = 6) -> List[RelatedTopic]:
        normalized_slug = _normalize_slug(slug)
        candidate_scores: defaultdict[str, int] = defaultdict(int)
        candidate_connections: dict[str, str] = {}
        candidate_slugs: dict[str, str] = {}
        candidate_order: dict[str, int] = {}

        def add_candidate(title_or_slug: str, score: int, connection: str) -> None:
            candidate_slug = _title_to_slug(title_or_slug)
            normalized_candidate = _normalize_slug(candidate_slug)
            if not candidate_slug or normalized_candidate == normalized_slug:
                return

            candidate_scores[normalized_candidate] += score
            candidate_slugs.setdefault(normalized_candidate, candidate_slug)
            candidate_connections.setdefault(normalized_candidate, connection)
            candidate_order.setdefault(normalized_candidate, len(candidate_order))

        for category in CURATED_CATEGORIES:
            category_slugs = [_normalize_slug(item) for item in category.slugs]
            if normalized_slug not in category_slugs:
                continue

            for related_slug in category.slugs:
                add_candidate(related_slug, 6, category.name)

        links, backlinks, categories = await asyncio.gather(
            wikipedia_service.get_article_links(slug, limit=50),
            wikipedia_service.get_backlinks(slug, limit=50),
            wikipedia_service.get_page_categories(slug, limit=50),
        )

        for title in links[:50]:
            add_candidate(title, 3, "Linked from article")

        for title in backlinks[:50]:
            add_candidate(title, 2, "Links to this article")

        useful_categories = [category for category in categories if _is_useful_category(category)]
        category_member_groups = await asyncio.gather(
            *[
                wikipedia_service.get_category_members(category, limit=15)
                for category in useful_categories[:3]
            ]
        )
        for category, members in zip(useful_categories[:3], category_member_groups):
            for title in members:
                add_candidate(title, 4, f"Shared category: {category}")

        ranked_candidates = sorted(
            candidate_scores,
            key=lambda key: (-candidate_scores[key], candidate_order[key]),
        )

        related_topics: list[RelatedTopic] = []
        for normalized_candidate in ranked_candidates[: limit * 5]:
            if len(related_topics) >= limit:
                break

            related_slug = candidate_slugs[normalized_candidate]
            connection = candidate_connections[normalized_candidate]
            summary = await wikipedia_service.get_page_summary(related_slug)
            if not summary:
                continue

            summary_text = " ".join(
                [
                    summary.get("title") or "",
                    summary.get("description") or "",
                    summary.get("extract") or "",
                    connection,
                ]
            )
            if not _text_matches_keywords(summary_text):
                continue

            related_topics.append(
                RelatedTopic(
                    slug=related_slug,
                    title=summary.get("title") or related_slug.replace("_", " "),
                    description=summary.get("description"),
                    thumbnail_url=summary.get("thumbnail_url"),
                    connection=connection,
                )
            )

        return related_topics
