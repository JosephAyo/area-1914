from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date as dt_date

class WikiTopic(SQLModel, table=True):
    """
    Represents a subject (Person, Event, Concept) tracked in the system.
    We identify unique topics by their canonical Wikipedia slug.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True) # Display Name: "M.K.O. Abiola"
    slug: str = Field(unique=True, index=True) # URL Slug: "Moshood_Abiola"
    
    # Metadata for the dashboard
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    
    # Cache Invalidaton Logic
    last_fetched_at: Optional[datetime] = Field(default=None)
    
    # Relationship
    pageviews: List["WikiPageview"] = Relationship(back_populates="topic")


class WikiPageview(SQLModel, table=True):
    """
    Daily pageview data for a specific topic.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt_date = Field(index=True)
    views: int
    
    # Foreign Key
    topic_id: Optional[int] = Field(default=None, foreign_key="wikitopic.id")
    topic: Optional[WikiTopic] = Relationship(back_populates="pageviews")

