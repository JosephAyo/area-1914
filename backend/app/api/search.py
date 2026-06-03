from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from app.services.wikipedia import wikipedia_service

router = APIRouter()

class SearchSuggestion(BaseModel):
    title: str
    thumbnail: Optional[str] = None

@router.get("/search", response_model=List[SearchSuggestion])
async def search_topics(q: str, limit: int = 5):
    """
    Search Wikipedia for matching articles.
    Useful for autocomplete and resolving partial matches.
    """
    if not q or not q.strip():
        return []

    results = await wikipedia_service.search_articles(q.strip(), limit=limit)
    return results
