import pytest
from app.services.citation_parser import parse_citations, categorize_citation

def test_categorize_citation():
    assert categorize_citation("cite news", {}) == ("newspaper", "Unknown Source")
    assert categorize_citation("cite web", {"website": "BBC"}) == ("web", "BBC")
    assert categorize_citation("cite journal", {"journal": "Nature"}) == ("journal", "Nature")
    assert categorize_citation("cite book", {"publisher": "Oxford"}) == ("book", "Oxford")

    # Fallbacks
    assert categorize_citation("cite generic", {"publisher": "gov.ng"}) == ("government", "gov.ng")

def test_parse_citations():
    wikitext = """
    This is some text.{{cite news |newspaper=The Guardian |title=Test}}
    More text.{{cite journal |journal=Science |url=http://example.com}}
    Even more.{{cite web |website=Nairaland}}
    """

    citations = parse_citations(wikitext)

    assert len(citations) == 3
    assert citations[0]["category"] == "newspaper"
    assert citations[0]["source_name"] == "The Guardian"

    assert citations[1]["category"] == "journal"
    assert citations[1]["source_name"] == "Science"
    assert citations[1]["url"] == "http://example.com"

    assert citations[2]["category"] == "web"
    assert citations[2]["source_name"] == "Nairaland"
