from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database import get_session
from app.managers import AnniversaryManager
from app.models import OnThisDayTopic

router = APIRouter()


@router.get("/on-this-day", response_model=List[OnThisDayTopic])
async def get_on_this_day(
    limit: int = 5,
    month: Optional[int] = None,
    day: Optional[int] = None,
    session: Session = Depends(get_session),
):
    if (month is None) != (day is None):
        raise HTTPException(
            status_code=422,
            detail="Provide both month and day, or neither.",
        )

    target_date = None
    if month is not None and day is not None:
        try:
            target_date = date(date.today().year, month, day)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid month/day.")

    manager = AnniversaryManager(session)
    safe_limit = max(1, min(limit, 12))
    return manager.get_on_this_day(target_date=target_date, limit=safe_limit)
