from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, HttpUrl, field_validator
from sqlmodel import Session, select

from app.database import get_session
from app.models import ClassificationReport
from app.services.classification import classification_key

router = APIRouter()


class ReportInput(BaseModel):
    slug: str = Field(min_length=1, max_length=300)
    requested_relevance: bool
    reason: str = Field(min_length=10, max_length=2000)
    source_url: HttpUrl | None = None

    @field_validator("slug", "reason", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class ReportReceipt(BaseModel):
    id: int
    status: Literal["pending"] = "pending"


@router.post("/classification-reports", response_model=ReportReceipt, status_code=201)
async def submit_report(payload: ReportInput, session: Session = Depends(get_session)):
    topic_key = classification_key(payload.slug)
    source_url = str(payload.source_url) if payload.source_url else None
    # Retry/double-submit returns the same pending receipt, not another report.
    existing = session.exec(select(ClassificationReport).where(
        ClassificationReport.topic_key == topic_key,
        ClassificationReport.requested_relevance == payload.requested_relevance,
        ClassificationReport.reason == payload.reason,
        ClassificationReport.source_url == source_url,
        ClassificationReport.status == "pending",
    )).first()
    if existing:
        assert existing.id is not None
        return ReportReceipt(id=existing.id)
    report = ClassificationReport(
        slug=payload.slug, topic_key=topic_key,
        requested_relevance=payload.requested_relevance,
        reason=payload.reason, source_url=source_url,
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    assert report.id is not None
    return ReportReceipt(id=report.id)
