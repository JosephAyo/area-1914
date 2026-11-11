"""Local maintainer queue: python -m app.review_reports --help."""
import argparse
import json
from datetime import datetime, timezone

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import ClassificationReport, RelevanceOverride


def review_report(session: Session, report_id: int, action: str, note: str):
    if action not in {"approve", "dismiss"} or not note.strip():
        raise ValueError("Choose approve or dismiss and provide a review note.")
    report = session.get(ClassificationReport, report_id)
    if not report or report.status != "pending":
        raise ValueError("Report not found or already reviewed.")
    now = datetime.now(timezone.utc)
    if action == "approve":
        override = session.exec(select(RelevanceOverride).where(
            RelevanceOverride.topic_key == report.topic_key
        )).first()
        if override is None:
            override = RelevanceOverride(
                topic_key=report.topic_key, relevant=report.requested_relevance,
                report_id=report_id,
            )
        override.relevant = report.requested_relevance
        override.report_id = report_id
        override.updated_at = now
        session.add(override)
    report.status = "approved" if action == "approve" else "dismissed"
    report.reviewed_at = now
    report.review_note = note.strip()
    session.add(report)
    session.commit()


def main():
    parser = argparse.ArgumentParser(description="Review classification reports locally; no public admin endpoint.")
    commands = parser.add_subparsers(dest="command", required=True)
    queue = commands.add_parser("list")
    queue.add_argument("--status", choices=["pending", "approved", "dismissed"], default="pending")
    queue.add_argument("--limit", type=int, default=50)
    review = commands.add_parser("review")
    review.add_argument("id", type=int)
    review.add_argument("action", choices=["approve", "dismiss"])
    review.add_argument("--note", required=True)
    args = parser.parse_args()
    create_db_and_tables()
    with Session(engine) as session:
        if args.command == "list":
            reports = session.exec(select(ClassificationReport).where(
                ClassificationReport.status == args.status
            ).order_by(ClassificationReport.created_at, ClassificationReport.id).limit(max(1, min(args.limit, 500)))).all()
            for report in reports:
                print(json.dumps(report.model_dump(mode="json"), ensure_ascii=False))
        else:
            try:
                review_report(session, args.id, args.action, args.note)
            except ValueError as error:
                parser.error(str(error))
            print(f"Report {args.id} reviewed.")


if __name__ == "__main__":
    main()
