from typing import Optional, List
from collections import Counter
from app.models import CitationSummary, CitationSource
from app.services.wikipedia import wikipedia_service
from app.services.citation_parser import parse_citations

class CitationManager:
    async def get_citation_summary(self, slug: str) -> Optional[CitationSummary]:
        """
        Fetches wikitext, parses citations, and aggregates the data.
        """
        wikitext = await wikipedia_service.get_article_wikitext(slug)
        if not wikitext:
            return None

        parsed_citations = parse_citations(wikitext)

        sources: List[CitationSource] = []
        category_counts = Counter()
        source_counts = Counter()

        for cit in parsed_citations:
            source_name = cit["source_name"]
            category = cit["category"]

            # Count for summary
            category_counts[category] += 1
            source_counts[source_name] += 1

            # Create model
            sources.append(CitationSource(
                source_name=source_name,
                category=category,
                url=cit.get("url")
            ))

        # Sort top sources
        top_sources_tuples = source_counts.most_common(10)
        top_sources = [name for name, count in top_sources_tuples]

        return CitationSummary(
            slug=slug,
            total_citations=len(sources),
            category_breakdown=dict(category_counts),
            top_sources=top_sources,
            sources=sources
        )
