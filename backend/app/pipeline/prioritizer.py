"""Priority scorer.

Final stage. Takes everything we know about an email (raw + classification +
extraction + suggested action) and produces:
  - A 0-100 priority score (higher = more urgent)
  - A binary needs_ryan flag (does Ryan personally need to touch this today?)
  - Reasoning Ryan can scan in the dashboard

Design note: the binary `needs_ryan` is the most operationally important field
in the whole system. Get this right and Ryan saves an hour a day. Get it wrong
in either direction and trust in the system collapses (false negatives = he
misses important things; false positives = he keeps doing email triage).

We bias toward false positives over false negatives — better to surface
something Ryan can quickly dismiss than to hide something that mattered.
"""

import json
from anthropic import Anthropic
from ..models import PriorityScore


MODEL = "claude-sonnet-4-6"
MODEL_VERSION = f"{MODEL}-prioritizer-v1"


PRIORITIZER_SYSTEM_PROMPT = """You score the priority of triaged emails for Ryan Caldbeck (CEO of Waystation AI). Your job is to surface what actually matters and hide what doesn't.

SCORING SCALE (0-100):

90-100: Critical. Ryan needs to touch this within hours.
  Examples: Outage report from a customer. Churn signal from a top customer. RFP from a strategic prospect with a deadline. Acquisition/M&A news from a customer. Co-founder/investor reaching out about something time-sensitive.

70-89: High. Ryan should personally handle this today.
  Examples: Hot inbound lead with specific need + urgency. Renewal/expansion conversation. Personal intro from a referrer he values. Bug affecting multiple customers.

50-69: Medium. Worth Ryan's attention but could wait or be delegated with oversight.
  Examples: Warm inbound lead. Recruiting candidate that looks strong. Routine customer support that's still substantive. VC intro (politely defer if not raising).

30-49: Low. Delegate or batch. Ryan shouldn't be the first responder.
  Examples: Generic inbound demo requests. Routine support tickets. Recruiter pitches.

10-29: Very low. Probably auto-archive but worth a glance.
  Examples: Vendor pitches that aren't spam. Calendly notifications for events already on Ryan's calendar.

0-9: Pure noise. Auto-archive without review.
  Examples: Stripe receipts. LinkedIn digests. Newsletter blasts. Promotional emails.

THE needs_ryan FLAG:

Set to true ONLY if Ryan PERSONALLY needs to engage. False if anyone else on the team could handle it, even if it's important.

True:
  - Founder-to-founder conversations
  - Top-customer churn/expansion conversations
  - Strategic prospect engagement (especially RFPs above a value threshold)
  - Investor/board communications
  - Personal relationships requiring his voice
  - Decisions that only he can make

False:
  - Anything a BDR, CS, or recruiter can handle
  - Routine support
  - Vendor pitches
  - Noise

BIAS: When uncertain, prefer needs_ryan=true. Missing something important is worse than over-surfacing.

OUTPUT FORMAT:

Return valid JSON only:
{
  "score": 0-100,
  "needs_ryan": true/false,
  "reasoning": "1-2 sentence explanation of the score, citing specific email content"
}

Make the reasoning useful — it appears in Ryan's dashboard. Tell him WHY this is the score, not what the score is."""


def score_priority(
    client: Anthropic,
    email: dict,
    category: str,
    extracted_fields: dict,
    suggested_action: str,
) -> PriorityScore:
    """Score the priority of an email given full triage context."""
    user_message = f"""Category: {category}
Suggested action: {suggested_action}

Extracted fields:
{json.dumps(extracted_fields, indent=2)}

ORIGINAL EMAIL:
From: {email.get('from_name', '')} <{email['from']}>
Subject: {email.get('subject', '(no subject)')}
Body:
{email.get('body', '')}

Score this email. Return JSON only."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        system=PRIORITIZER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 2)[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.rsplit("```", 1)[0].strip()

    parsed = json.loads(raw_text)
    return PriorityScore(**parsed)
