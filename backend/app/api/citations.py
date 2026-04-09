from fastapi import APIRouter, HTTPException
from app.managers import CitationManager
from app.models import CitationSummary

router = APIRouter()

@router.get("/topics/{slug}/sources", response_model=CitationSummary)
async def get_citation_sources(slug: str):
    manager = CitationManager()
    summary = await manager.get_citation_summary(slug)

    if not summary:
        raise HTTPException(status_code=404, detail="Topic or citations not found")

    return summary
