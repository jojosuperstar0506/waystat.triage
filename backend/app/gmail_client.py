"""Gmail API client.

Real Gmail API integration via google-api-python-client. Two modes:

1. LIVE mode: pulls recent emails from the connected Gmail account.
2. FIXTURE mode: reads from data/synthetic_emails.json for reliable demo.

The demo flow uses both: the OAuth is real (Ryan sees it works) but the
inbox content is seeded synthetically so the demo doesn't depend on actual
inbound mail to the demo account.

Setup (one-time):
  1. Create a Google Cloud project, enable the Gmail API
  2. Create OAuth 2.0 Desktop credentials, download as credentials.json
  3. First run will open a browser for OAuth consent, then save token.json
"""

import json
import os
import base64
from pathlib import Path
from typing import Optional

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
CREDENTIALS_PATH = Path(os.environ.get("GMAIL_CREDENTIALS_PATH", "credentials.json"))
TOKEN_PATH = Path(os.environ.get("GMAIL_TOKEN_PATH", "token.json"))


def get_gmail_service():
    """Authenticated Gmail API client. Triggers OAuth flow on first run."""
    creds: Optional[Credentials] = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH), SCOPES
            )
            creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def _extract_body(payload: dict) -> str:
    """Recursively extract plaintext body from a Gmail message payload."""
    if payload.get("mimeType") == "text/plain" and "data" in payload.get("body", {}):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        body = _extract_body(part)
        if body:
            return body
    return ""


def fetch_recent_emails_live(max_results: int = 30) -> list[dict]:
    """Pull recent emails from the live Gmail account."""
    service = get_gmail_service()
    listing = service.users().messages().list(
        userId="me", maxResults=max_results, q="-in:sent -in:drafts"
    ).execute()
    messages = listing.get("messages", [])

    results = []
    for m in messages:
        full = service.users().messages().get(
            userId="me", id=m["id"], format="full"
        ).execute()

        headers = {h["name"].lower(): h["value"] for h in full["payload"]["headers"]}
        from_header = headers.get("from", "")
        # Parse "Name <email@x.com>" format
        if "<" in from_header:
            from_name = from_header.split("<")[0].strip().strip('"')
            from_addr = from_header.split("<")[1].rstrip(">").strip()
        else:
            from_name = ""
            from_addr = from_header.strip()

        results.append({
            "id": m["id"],
            "thread_id": full.get("threadId"),
            "from": from_addr,
            "from_name": from_name,
            "to": headers.get("to", ""),
            "subject": headers.get("subject", ""),
            "body": _extract_body(full["payload"]),
            "received_at": headers.get("date", ""),
        })
    return results


def fetch_emails_fixture(fixture_path: str = "data/synthetic_emails.json") -> list[dict]:
    """Load emails from the synthetic fixture. Used for demo reliability."""
    with open(fixture_path) as f:
        data = json.load(f)
    return data["emails"]


def fetch_emails(mode: str = "fixture") -> list[dict]:
    """Unified fetch interface. mode='live' or 'fixture'."""
    if mode == "live":
        return fetch_recent_emails_live()
    return fetch_emails_fixture()
