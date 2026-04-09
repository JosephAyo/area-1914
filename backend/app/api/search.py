from fastapi import APIRouter
from typing import List
from app.services.wikipedia import wikipedia_service

router = APIRouter()

@router.get("/search", response_model=List[str])
async def search_topics(q: str, limit: int = 5):
    """
    Search Wikipedia for matching articles.
    Useful for autocomplete and resolving partial matches.
    """
    if not q or not q.strip():
        return []

    results = await wikipedia_service.search_articles(q.strip(), limit=limit)
    return results
