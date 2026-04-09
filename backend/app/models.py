from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date as dt_date

# --- Base Models (Shared Fields) ---

class WikiPageviewBase(SQLModel):
    date: dt_date = Field(index=True)
    views: int

class WikiTopicBase(SQLModel):
    title: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    last_fetched_at: Optional[datetime] = Field(default=None)

# --- Database Models (Table=True) ---

class WikiTopic(WikiTopicBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Relationship
    pageviews: List["WikiPageview"] = Relationship(back_populates="topic")


class WikiPageview(WikiPageviewBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign Key
    topic_id: Optional[int] = Field(default=None, foreign_key="wikitopic.id")
    topic: Optional[WikiTopic] = Relationship(back_populates="pageviews")

# --- API/Public Models (For Responses) ---

# What we return to the client. Includes the list of views.
class WikiTopicPublic(WikiTopicBase):
    id: int
    pageviews: List[WikiPageviewBase] = []

class TrendingArticle(SQLModel):
    """Response model for a trending article."""
    slug: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    current_views: int        # views in recent period
    previous_views: int       # views in comparison period
    trend_score: float        # % change

class CitationSource(SQLModel):
    """A single parsed citation."""
    source_name: str          # e.g. "The Guardian", "Nature"
    category: str             # newspaper, journal, web, etc.
    url: Optional[str] = None

class CitationSummary(SQLModel):
    """Aggregated citation data for an article."""
    slug: str
    total_citations: int
    category_breakdown: dict  # e.g. {"newspaper": 12, "journal": 5}
    top_sources: list         # list of strings: Top N source names by frequency
    sources: list[CitationSource] # Full list of CitationSource
