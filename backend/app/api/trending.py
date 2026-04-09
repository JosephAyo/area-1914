from fastapi import APIRouter, Depends
from typing import List
from sqlmodel import Session
from app.database import get_session
from app.managers import TrendingManager
from app.models import TrendingArticle

router = APIRouter()

@router.get("/trending", response_model=List[TrendingArticle])
async def get_trending(
    limit: int = 10,
    period_days: int = 30,
    session: Session = Depends(get_session)
):
    manager = TrendingManager(session)
    trending_articles = await manager.get_trending(limit=limit, period_days=period_days)
    return trending_articles
