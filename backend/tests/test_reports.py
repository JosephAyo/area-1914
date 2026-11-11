from datetime import datetime, timezone

import pytest
from sqlmodel import select

from app.models import ClassificationReport, RelevanceOverride, WikiTopic
from app.review_reports import review_report
from app.managers.topic_manager import TopicManager


def payload(**changes):
    return {"slug": "Fela Kuti", "requested_relevance": True,
            "reason": "This subject has a documented connection to Nigeria.",
            "source_url": "https://en.wikipedia.org/wiki/Fela_Kuti", **changes}


@pytest.mark.asyncio
async def test_reports_save_without_changing_classification_and_deduplicate(client, session):
    response = await client.post("/api/classification-reports", json=payload())
    assert response.status_code == 201
    receipt = response.json()
    assert set(receipt) == {"id", "status"}
    assert receipt["status"] == "pending"
    stored = session.get(ClassificationReport, receipt["id"])
    assert stored.topic_key == "fela_kuti"
    assert stored.reason == payload()["reason"]
    assert session.exec(select(RelevanceOverride)).all() == []
    duplicate = await client.post("/api/classification-reports", json=payload(slug="  Fela_Kuti "))
    assert duplicate.json() == receipt
    assert len(session.exec(select(ClassificationReport)).all()) == 1
    # Explanations and review actions have no public HTTP interface.
    assert (await client.get("/api/classification-reports")).status_code == 405


@pytest.mark.asyncio
@pytest.mark.parametrize("change", [
    {"slug": "   "}, {"reason": "         "}, {"reason": "x" * 2001},
    {"source_url": "javascript:alert(1)"}, {"requested_relevance": "invalid"},
])
async def test_invalid_reports_are_rejected(client, session, change):
    assert (await client.post("/api/classification-reports", json=payload(**change))).status_code == 422
    assert session.exec(select(ClassificationReport)).all() == []


@pytest.mark.asyncio
async def test_approved_inclusion_bypasses_automatic_rejection(client, session, monkeypatch):
    receipt = (await client.post("/api/classification-reports", json=payload())).json()
    review_report(session, receipt["id"], "approve", "Verified the supplied reference.")
    report = session.get(ClassificationReport, receipt["id"])
    assert report.status == "approved"
    assert report.reviewed_at is not None

    async def summary(slug):
        return {"title": "Fela Kuti", "description": "Musician"}

    async def views(*args):
        return []

    async def should_not_check(slug):
        raise AssertionError("Reviewed inclusion must override keyword checking")

    from app.managers import topic_manager
    monkeypatch.setattr(topic_manager.wikipedia_service, "get_page_summary", summary)
    monkeypatch.setattr(topic_manager.wikipedia_service, "get_pageviews", views)
    monkeypatch.setattr(topic_manager, "is_nigerian_topic", should_not_check)
    response = await client.get("/api/topics/Fela_Kuti")
    assert response.status_code == 200
    assert response.json()["title"] == "Fela Kuti"


@pytest.mark.asyncio
async def test_approved_exclusion_blocks_an_already_cached_topic(client, session, monkeypatch):
    session.add(WikiTopic(slug="Fela_Kuti", title="Fela Kuti", last_fetched_at=datetime.now(timezone.utc)))
    session.commit()
    receipt = (await client.post("/api/classification-reports", json=payload(requested_relevance=False))).json()
    # A public report alone must not remove the existing subject.
    assert await TopicManager(session).get_topic_with_history("Fela_Kuti") is not None
    review_report(session, receipt["id"], "approve", "Test review.")
    response = await client.get("/api/topics/Fela_Kuti")
    assert response.status_code == 422
    assert "reviewed as unrelated" in response.json()["detail"]
    assert (await client.get("/api/trending")).json() == []
    from app.api import featured
    from app.config.curated_topics import CuratedCategory
    monkeypatch.setattr(featured, "CURATED_CATEGORIES", [CuratedCategory("Culture", "", ["Fela_Kuti"])])
    assert (await client.get("/api/topics/featured")).json() == []


@pytest.mark.asyncio
async def test_related_suggestions_respect_reviewed_inclusions_and_exclusions(client, session, monkeypatch):
    for slug, relevant in [("Denied_Topic", False), ("Allowed_Topic", True)]:
        receipt = (await client.post("/api/classification-reports", json=payload(slug=slug, requested_relevance=relevant))).json()
        review_report(session, receipt["id"], "approve", "Checked supporting sources.")
    from app.services.wikipedia import wikipedia_service

    async def links(*args, **kwargs):
        return ["Denied Topic", "Allowed Topic"]

    async def empty(*args, **kwargs):
        return []

    async def summary(slug):
        assert slug != "Denied_Topic"
        return {"title": "Allowed Topic", "description": "Musician", "extract": ""}

    monkeypatch.setattr(wikipedia_service, "get_article_links", links)
    monkeypatch.setattr(wikipedia_service, "get_backlinks", empty)
    monkeypatch.setattr(wikipedia_service, "get_page_categories", empty)
    monkeypatch.setattr(wikipedia_service, "get_page_summary", summary)
    response = await client.get("/api/topics/Base_Topic/related")
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["Allowed_Topic"]


@pytest.mark.asyncio
async def test_dismissal_leaves_no_override_and_cannot_be_reviewed_twice(client, session):
    receipt = (await client.post("/api/classification-reports", json=payload())).json()
    review_report(session, receipt["id"], "dismiss", "Evidence does not support the change.")
    assert session.get(ClassificationReport, receipt["id"]).status == "dismissed"
    assert session.exec(select(RelevanceOverride)).all() == []
    with pytest.raises(ValueError, match="already reviewed"):
        review_report(session, receipt["id"], "approve", "Attempt a second review.")


@pytest.mark.asyncio
async def test_later_approved_report_can_correct_an_existing_override(client, session):
    for relevant in [False, True]:
        receipt = (await client.post("/api/classification-reports", json=payload(requested_relevance=relevant))).json()
        review_report(session, receipt["id"], "approve", "Reviewed new evidence.")
    overrides = session.exec(select(RelevanceOverride)).all()
    assert len(overrides) == 1
    assert overrides[0].relevant is True
    assert overrides[0].report_id == receipt["id"]


@pytest.mark.asyncio
async def test_submission_and_review_persist_across_database_sessions(tmp_path):
    from httpx import ASGITransport, AsyncClient
    from sqlmodel import Session, SQLModel, create_engine
    from app.main import app
    from app.database import get_session

    engine = create_engine(f"sqlite:///{tmp_path / 'reports.db'}", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)

    def local_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = local_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            receipt = (await client.post("/api/classification-reports", json=payload())).json()
        with Session(engine) as session:
            assert session.get(ClassificationReport, receipt["id"]).status == "pending"
            review_report(session, receipt["id"], "approve", "Verified reference.")
        with Session(engine) as session:
            assert session.get(ClassificationReport, receipt["id"]).status == "approved"
            assert session.exec(select(RelevanceOverride)).one().relevant is True
    finally:
        app.dependency_overrides.pop(get_session, None)
        engine.dispose()
