"""Shared keys for reports and reviewed relevance decisions."""
import re
import unicodedata


def classification_key(slug: str) -> str:
    return re.sub(r"[\s_]+", "_", unicodedata.normalize("NFC", slug).strip()).casefold()
