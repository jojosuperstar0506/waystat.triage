"""FastAPI server.

Endpoints:
  GET  /health                — basic health check
  POST /ingest                — fetch emails (live or fixture), run pipeline, write to DB
  GET  /inbox                 — read triaged inbox from DB, sorted by priority
  GET  /inbox/{email_id}      — full detail on one triaged email
  POST /feedback/{email_id}   — record human feedback (for eval / ground truth)
"""

import logging
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic

from .triage import triage_email
from .gmail_client import fetch_emails
from .db import upsert_email, write_triage_result, get_triage_inbox, get_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Waystation Triage", version="0.1.0")

# CORS: allow the Vercel frontend to talk to this
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


class IngestRequest(BaseModel):
    mode: str = "fixture"  # "fixture" or "live"
    limit: Optional[int] = None


@app.post("/ingest")
def ingest(req: IngestRequest):
    """Fetch emails, run the full pipeline, write results to DB."""
    emails = fetch_emails(mode=req.mode)
    if req.limit:
        emails = emails[: req.limit]

    client = Anthropic()
    results = []
    for email in emails:
        try:
            email_uuid = upsert_email(email)
            triage_result = triage_email(client, email)
            write_triage_result(email_uuid, triage_result)
            results.append({
                "email_id": email["id"],
                "ok": True,
                "category": triage_result.classification.category,
                "priority_score": triage_result.priority.score,
                "needs_ryan": triage_result.priority.needs_ryan,
            })
        except Exception as e:
            logger.exception(f"Failed on {email.get('id')}")
            results.append({"email_id": email.get("id"), "ok": False, "error": str(e)})

    return {
        "ingested": len(results),
        "succeeded": sum(1 for r in results if r["ok"]),
        "failed": sum(1 for r in results if not r["ok"]),
        "results": results,
    }


@app.get("/inbox")
def inbox(limit: int = 100):
    """Return the full triaged inbox, sorted by priority."""
    return {"emails": get_triage_inbox(limit=limit)}


@app.get("/inbox/{email_id}")
def inbox_detail(email_id: str):
    """Return one email's full triage record."""
    client = get_client()
    result = client.table("triage_inbox").select("*").eq("email_id", email_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Email not found")
    return result.data[0]


class FeedbackRequest(BaseModel):
    classification_correct: bool
    correct_category: Optional[str] = None
    response_quality: Optional[int] = None  # 1-5
    priority_correct: Optional[bool] = None
    notes: Optional[str] = None
    reviewed_by: str = "ryan"


@app.post("/feedback/{email_id}")
def submit_feedback(email_id: str, req: FeedbackRequest):
    """Record human feedback on a triage result. Builds the eval set over time."""
    client = get_client()
    payload = req.model_dump()
    payload["email_id"] = email_id
    client.table("human_feedback").upsert(payload, on_conflict="email_id").execute()
    return {"ok": True}
