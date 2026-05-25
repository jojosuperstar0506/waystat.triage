"""Pipeline orchestrator.

Runs the full triage pipeline on one email or a batch. Each stage is
independent so we can re-run any stage in isolation when iterating on prompts.

Usage:
    from anthropic import Anthropic
    from app.triage import triage_email

    client = Anthropic()
    result = triage_email(client, email_dict)
"""

import logging
from typing import Optional
from anthropic import Anthropic

from .models import TriageResult
from .pipeline import (
    classify_email,
    extract_fields,
    draft_response,
    score_priority,
)

logger = logging.getLogger(__name__)


def triage_email(
    client: Anthropic,
    email: dict,
    email_id: Optional[str] = None,
) -> TriageResult:
    """Run the full pipeline on a single email.

    Args:
        client: Anthropic client
        email: dict with keys: from, from_name, to, subject, body, received_at
        email_id: optional ID to thread through; defaults to email['id']

    Returns:
        TriageResult with all four stages' outputs validated.
    """
    eid = email_id or email.get("id", "unknown")
    logger.info(f"[{eid}] Starting triage")

    # Stage 1: Classify
    classification = classify_email(client, email)
    logger.info(f"[{eid}] Classified as {classification.category} ({classification.confidence:.2f})")

    # Stage 2: Extract structured fields
    extraction = extract_fields(client, email, classification.category)
    logger.info(f"[{eid}] Extracted {len(extraction.fields)} fields")

    # Stage 3: Draft response + suggest action
    drafted = draft_response(client, email, classification.category, extraction.fields)
    logger.info(f"[{eid}] Suggested action: {drafted.suggested_action}")

    # Stage 4: Priority score
    priority = score_priority(
        client, email, classification.category, extraction.fields, drafted.suggested_action
    )
    logger.info(f"[{eid}] Priority: {priority.score}/100, needs_ryan={priority.needs_ryan}")

    return TriageResult(
        email_id=eid,
        classification=classification,
        extraction=extraction,
        drafted_response=drafted,
        priority=priority,
    )


def triage_batch(
    client: Anthropic,
    emails: list[dict],
    continue_on_error: bool = True,
) -> list[dict]:
    """Triage a list of emails. Returns list of result dicts (or error dicts on failure).

    For each email returns:
      - {"email_id": ..., "ok": True, "result": TriageResult dict}
      - {"email_id": ..., "ok": False, "error": str}
    """
    results = []
    for i, email in enumerate(emails):
        eid = email.get("id", f"email_{i}")
        try:
            result = triage_email(client, email, email_id=eid)
            results.append({"email_id": eid, "ok": True, "result": result.model_dump()})
        except Exception as e:
            logger.exception(f"[{eid}] Failed: {e}")
            if not continue_on_error:
                raise
            results.append({"email_id": eid, "ok": False, "error": str(e)})
    return results
