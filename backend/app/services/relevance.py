"""
Nigerian-relevance checker for Wikipedia topics.

Uses Wikipedia categories and page summary to determine whether
a topic is sufficiently related to Nigeria before archiving.
"""

from app.services.wikipedia import wikipedia_service
import logging

logger = logging.getLogger(__name__)

# Keywords that indicate a topic is related to Nigeria.
# Checked against Wikipedia categories (case-insensitive).
NIGERIA_KEYWORDS = [
    "nigeria",
    "nigerian",
    "lagos",
    "abuja",
    "yoruba",
    "igbo",
    "hausa",
    "fulani",
    "fula",
    "biafra",
    "biafran",
    "nollywood",
    "naira",
    "edo",
    "benin empire",
    "kingdom of benin",
    "sokoto",
    "kaduna",
    "kano",
    "niger delta",
    "afrobeat",
    "afrobeats",
    "calabar",
    "enugu",
    "ibadan",
    "oyo empire",
    "nri kingdom",
    "kingdom of nri",
    "boko haram",
    "efik",
    "ibibio",
    "ijaw",
    "kanuri",
    "tiv people",
    "nupe",
    "urhobo",
    "itsekiri",
    "ogoni",
    "isoko",
    "esan",
    "afemai",
]


def _text_matches_keywords(text: str) -> bool:
    """Check if any Nigeria keyword appears in the given text (case-insensitive)."""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in NIGERIA_KEYWORDS)


async def is_nigerian_topic(slug: str) -> bool:
    """
    Determines if a Wikipedia topic is related to Nigeria.

    Strategy:
      1. Fetch Wikipedia categories for the article.
         If any category name contains a Nigerian keyword → True.
      2. Fallback: Fetch the page summary and check the description
         and extract for Nigerian keywords → True.
      3. Otherwise → False.
    """
    # --- Step 1: Check categories ---
    try:
        categories = await wikipedia_service.get_page_categories(slug)
        for cat in categories:
            if _text_matches_keywords(cat):
                logger.info(
                    f"Topic '{slug}' identified as Nigerian via category: '{cat}'"
                )
                return True
    except Exception as e:
        logger.warning(f"Could not fetch categories for '{slug}': {e}")

    # --- Step 2: Fallback - check summary text ---
    try:
        summary = await wikipedia_service.get_page_summary(slug)
        if summary:
            description = summary.get("description", "") or ""
            extract = summary.get("extract", "") or ""
            combined = f"{description} {extract}"
            if _text_matches_keywords(combined):
                logger.info(
                    f"Topic '{slug}' identified as Nigerian via summary text."
                )
                return True
    except Exception as e:
        logger.warning(f"Could not fetch summary for '{slug}': {e}")

    logger.info(f"Topic '{slug}' does NOT appear to be related to Nigeria.")
    return False
