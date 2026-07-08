from datetime import date

import pytest
from httpx import AsyncClient
from sqlmodel import Session

from app.models import WikiPageview, WikiTopic


def add_baseline(session: Session, topic_id: int, target: date, views: int):
    session.add_all(
        [
            WikiPageview(topic_id=topic_id, date=date(target.year, target.month, target.day - 1), views=views),
            WikiPageview(topic_id=topic_id, date=date(target.year, target.month, target.day + 1), views=views),
        ]
    )


@pytest.fixture
def seed_anniversary_data(session: Session):
    topic_1 = WikiTopic(slug="Spike_Topic", title="Spike Topic", description="Sudden spike")
    topic_2 = WikiTopic(slug="Bigger_Raw_Topic", title="Bigger Raw Topic", description="Less unusual")
    topic_3 = WikiTopic(slug="Unrelated_Date", title="Unrelated Date")
    topic_4 = WikiTopic(slug="Evergreen_Topic", title="Evergreen Topic")
    topic_5 = WikiTopic(slug="Duplicate_Topic", title="Duplicate Topic")
    topic_6 = WikiTopic(slug="Duplicate Topic", title="Duplicate Topic")
    session.add_all([topic_1, topic_2, topic_3, topic_4, topic_5, topic_6])
    session.commit()

    target_2025 = date(2025, 7, 8)
    target_2021 = date(2021, 7, 8)

    session.add_all(
        [
            WikiPageview(topic_id=topic_1.id, date=target_2025, views=100),
            WikiPageview(topic_id=topic_2.id, date=target_2021, views=250),
            WikiPageview(topic_id=topic_3.id, date=date(2025, 7, 9), views=500),
            WikiPageview(topic_id=topic_4.id, date=target_2025, views=1000),
            WikiPageview(topic_id=topic_5.id, date=target_2025, views=80),
            WikiPageview(topic_id=topic_5.id, date=target_2021, views=120),
            WikiPageview(topic_id=topic_6.id, date=target_2025, views=70),
        ]
    )
    add_baseline(session, topic_1.id, target_2025, views=10)
    add_baseline(session, topic_2.id, target_2021, views=100)
    add_baseline(session, topic_4.id, target_2025, views=950)
    add_baseline(session, topic_5.id, target_2025, views=20)
    add_baseline(session, topic_5.id, target_2021, views=20)
    add_baseline(session, topic_6.id, target_2025, views=20)
    session.commit()


@pytest.mark.asyncio
async def test_on_this_day_returns_ranked_anniversaries(
    client: AsyncClient,
    seed_anniversary_data,
):
    response = await client.get("/api/on-this-day?month=7&day=8")

    assert response.status_code == 200
    data = response.json()
    assert [item["slug"] for item in data] == [
        "Spike_Topic",
        "Duplicate_Topic",
        "Bigger_Raw_Topic",
    ]
    assert "Evergreen_Topic" not in [item["slug"] for item in data]
    assert data[0]["lift_score"] == 10.0
    assert data[0]["baseline_views"] == 10.0
    assert data[1]["date"] == "2021-07-08"
    assert data[1]["years_ago"] == 5
    assert data[1]["lift_score"] == 6.0


@pytest.mark.asyncio
async def test_on_this_day_requires_month_and_day(client: AsyncClient):
    response = await client.get("/api/on-this-day?month=7")

    assert response.status_code == 422
    assert response.json()["detail"] == "Provide both month and day, or neither."
