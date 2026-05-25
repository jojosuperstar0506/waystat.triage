"""Quick smoke test of the pipeline.

Runs on 5 representative emails covering different categories. No Supabase
needed — just exercises the LLM pipeline and prints results.

Usage:
    ANTHROPIC_API_KEY=... python eval/smoke_test.py
"""

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from anthropic import Anthropic
from app.triage import triage_email


# Representative subset — one of each category that's a clear test of pipeline behavior
TEST_IDS = [
    "email_001",  # hot sales inquiry — should be high priority, needs_ryan, personal response
    "email_004",  # Stripe noise — should be auto_archive, score ~0
    "email_010",  # renewal w/ seat reduction — high priority, needs_ryan, no draft
    "email_015",  # production outage — top priority, flag_to_engineering
    "email_026",  # cancellation — top priority, needs_ryan
]


def main():
    root = Path(__file__).resolve().parent.parent
    with open(root / "data" / "synthetic_emails.json") as f:
        all_emails = {e["id"]: e for e in json.load(f)["emails"]}

    client = Anthropic()

    print("=" * 70)
    print("SMOKE TEST — Waystation Triage Pipeline")
    print("=" * 70)

    start = time.time()
    for eid in TEST_IDS:
        email = all_emails[eid]
        print(f"\n{'─' * 70}")
        print(f"EMAIL: {eid}")
        print(f"From: {email['from_name']} <{email['from']}>")
        print(f"Subject: {email['subject']}")
        print()

        t0 = time.time()
        result = triage_email(client, email, email_id=eid)
        dt = time.time() - t0

        print(f"  Category:      {result.classification.category} (conf {result.classification.confidence:.2f})")
        print(f"  Reasoning:     {result.classification.reasoning}")
        print()
        print(f"  Priority:      {result.priority.score}/100")
        print(f"  Needs Ryan:    {result.priority.needs_ryan}")
        print(f"  Why:           {result.priority.reasoning}")
        print()
        print(f"  Action:        {result.drafted_response.suggested_action}")
        print(f"  Action why:    {result.drafted_response.action_reasoning}")
        if result.drafted_response.draft_body:
            print()
            print(f"  Draft:")
            for line in result.drafted_response.draft_body.split("\n"):
                print(f"    {line}")
        print()
        print(f"  Extracted fields:")
        for k, v in result.extraction.fields.items():
            print(f"    {k}: {v}")
        print()
        print(f"  ({dt:.1f}s)")

    print(f"\n{'=' * 70}")
    print(f"Done in {time.time() - start:.1f}s total")


if __name__ == "__main__":
    main()
