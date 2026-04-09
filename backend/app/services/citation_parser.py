import mwparserfromhell
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def parse_citations(wikitext: str) -> List[Dict[str, Any]]:
    """
    Parses wikitext and extracts cite templates into a structured dictionary.
    """
    if not wikitext:
        return []

    try:
        wikicode = mwparserfromhell.parse(wikitext)
        templates = wikicode.filter_templates()
    except Exception as e:
        logger.error(f"Error parsing wikitext: {e}")
        return []

    citations = []

    for template in templates:
        name = str(template.name).strip().lower()

        # We only care about citation templates, usually starting with "cite "
        if not name.startswith("cite "):
            continue

        # Extract parameters
        params = {}
        for param in template.params:
            param_name = str(param.name).strip().lower()
            param_value = str(param.value).strip()
            params[param_name] = param_value

        category, source_name = categorize_citation(name, params)
        if not source_name:
            source_name = "Unknown Source"

        url = params.get("url", None)

        citations.append({
            "source_name": source_name,
            "category": category,
            "url": url,
            "template_name": name
        })

    return citations

def categorize_citation(template_name: str, params: Dict[str, str]) -> tuple[str, str]:
    """
    Returns (category, source_name) based on the template name and parameters.
    """
    # Look for common source indicators
    publisher = params.get("publisher", "")
    work = params.get("work", "")
    newspaper = params.get("newspaper", "")
    journal = params.get("journal", "")
    magazine = params.get("magazine", "")
    website = params.get("website", "")
    title = params.get("title", "")

    source_name = newspaper or journal or magazine or work or website or publisher

    # Priority Categorization Logic
    if "cite news" in template_name or newspaper:
        return "newspaper", source_name or title or "Unknown Source"
    if "cite journal" in template_name or journal:
        return "journal", source_name or title or "Unknown Source"
    if "cite magazine" in template_name or magazine:
        return "magazine", source_name or title or "Unknown Source"
    if "cite book" in template_name:
        return "book", publisher or title or "Unknown Publisher"
    if "cite government" in template_name or "cite report" in template_name or "gov" in publisher.lower():
         return "government", source_name or publisher or title or "Unknown Source"
    if "cite web" in template_name or website:
        return "web", source_name or website or title or "Unknown Source"

    return "other", source_name or title or template_name or "Unknown Source"
