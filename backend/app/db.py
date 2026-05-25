"""Supabase client wrapper.

Thin layer over the supabase-py client. Handles inserting pipeline outputs
into the right tables. Reads come through the `triage_inbox` view defined
in schema.sql.
"""

import os
from typing import Optional
from supabase import create_client, Client

from .models import TriageResult


_client: Optional[Client] = None


def get_client() -> Client:
    """Lazy singleton Supabase client."""
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]  # service key for server-side writes
        _client = create_client(url, key)
    return _client


def upsert_email(email: dict) -> str:
    """Insert raw email/item if not already present. Returns email row UUID.

    Works for both external emails and internal queue items. Source is
    inferred from the email dict — defaults to 'external' if not specified.
    """
    client = get_client()
    payload = {
        "gmail_message_id": email["id"],
        "thread_id": email.get("thread_id"),
        "source": email.get("source", "external"),
        "channel": email.get("channel"),
        "from_address": email["from"],
        "from_name": email.get("from_name"),
        "from_role": email.get("from_role"),
        "to_address": email["to"],
        "subject": email.get("subject"),
        "body": email.get("body"),
        "received_at": email.get("received_at"),
    }
    result = client.table("emails").upsert(
        payload, on_conflict="gmail_message_id"
    ).execute()
    return result.data[0]["id"]


def write_triage_result(email_uuid: str, result: TriageResult) -> None:
    """Write all four pipeline outputs to their respective tables."""
    client = get_client()

    client.table("classifications").insert({
        "email_id": email_uuid,
        "source": result.classification.source,
        "category": result.classification.category,
        "confidence": result.classification.confidence,
        "reasoning": result.classification.reasoning,
        "model_version": "claude-sonnet-4-6-v2",
    }).execute()

    client.table("extractions").insert({
        "email_id": email_uuid,
        "fields": result.extraction.fields,
        "model_version": "claude-sonnet-4-6-extractor-v1",
    }).execute()

    client.table("drafted_responses").insert({
        "email_id": email_uuid,
        "draft_body": result.drafted_response.draft_body,
        "suggested_action": result.drafted_response.suggested_action,
        "action_reasoning": result.drafted_response.action_reasoning,
        "confidence": result.drafted_response.confidence,
        "model_version": "claude-sonnet-4-6-drafter-v1",
    }).execute()

    client.table("priority_scores").insert({
        "email_id": email_uuid,
        "score": result.priority.score,
        "needs_ryan": result.priority.needs_ryan,
        "reasoning": result.priority.reasoning,
        "model_version": "claude-sonnet-4-6-prioritizer-v1",
    }).execute()


def get_triage_inbox(limit: int = 100) -> list[dict]:
    """Read the triaged inbox view, sorted by priority."""
    client = get_client()
    result = client.table("triage_inbox").select("*").limit(limit).execute()
    return result.data
