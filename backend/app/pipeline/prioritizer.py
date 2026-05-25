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


PRIORITIZER_SYSTEM_PROMPT = """You score the priority of triaged items for Ryan Caldbeck (CEO of Waystation AI). The queue contains BOTH external items (customers, prospects, vendors) AND internal items (teammates, board, internal escalations). Your job is to surface what actually matters today — across both sources — and hide what doesn't.

CROSS-SOURCE PRIORITIZATION PRINCIPLE:

Internal and external items are scored on the same scale. An internal item that blocks the eng team's sprint can absolutely outrank an external sales inquiry. An external production outage outranks a routine internal FYI. The right way to think about it: what creates the most value or avoids the most damage if Ryan handles it in the next few hours?

SCORING SCALE (0-100):

90-100: Critical. Ryan needs to touch this within hours.
  External examples: Outage report from a customer. Churn signal from a top customer. RFP from a strategic prospect with a deadline. Cancellation from a top customer.
  Internal examples: Build-vs-buy decision blocking the eng sprint. Pricing exception with EOD deadline. Senior hire with competing offer closing this week. Board member with substantive pre-meeting question.

70-89: High. Ryan should personally handle this today.
  External examples: Hot inbound lead. Renewal/expansion conversation. Personal intro from a valued referrer.
  Internal examples: Direct report flight-risk signal (career conversation request). Strategic finance decision (runway planning). Customer escalation needing CEO call.

50-69: Medium. Worth Ryan's attention but could wait or be delegated with oversight.
  External examples: Warm inbound lead. Recruiting candidate that looks strong.
  Internal examples: Product pattern flagged for roadmap conversation. BDR template feedback request. Demo prep input request.

30-49: Low. Delegate or batch.
  External examples: Generic inbound demo requests. Routine support tickets.
  Internal examples: Small infra decisions where eng has a preference. Routine internal coordination.

10-29: Very low. Probably auto-archive.
  External examples: Vendor pitches that aren't spam. Calendly notifications.
  Internal examples: Engineering FYI updates on shipped work. Financial status updates with no decisions.

0-9: Pure noise. Auto-archive without review.
  Examples: Stripe receipts, LinkedIn digests, automated platform notifications.

THE needs_ryan FLAG:

Set to true ONLY if Ryan PERSONALLY needs to engage. False if anyone else on the team could handle it.

For external items, this is straightforward: founder-to-founder, top-customer churn/expansion, strategic prospects, investor comms, personal relationships.

For internal items, the bar is different. Many internal items LOOK like they need Ryan but actually need someone else to make the call:
  - eng_decision on a major fork = needs_ryan TRUE
  - eng_decision on a minor infra choice where someone else has a preference = needs_ryan FALSE
  - hr_decision (offer letter, termination) = always needs_ryan TRUE
  - internal_escalation about a customer = needs_ryan TRUE if the resolution requires CEO authority (resource reallocation, pricing exception, going around standard process), FALSE if it just needs information
  - direct_report_request = TRUE if it's a relationship conversation (1:1, career, feedback), FALSE if it's tactical
  - board_communication = always needs_ryan TRUE
  - finance_decision = TRUE for capital allocation / runway calls, FALSE for routine reporting
  - internal_fyi = always needs_ryan FALSE (it's an FYI)

BIAS: When uncertain, prefer needs_ryan=true. Missing something important is worse than over-surfacing.

CRITICAL CROSS-SOURCE JUDGMENTS:

- An internal item that blocks N other people's work scales with N. A build-vs-buy call blocking 6 engineers is higher priority than a single inbound demo request.
- An internal "no decision needed" FYI should ALWAYS score under 30, even if it's about something important. The system shouldn't surface FYIs.
- Direct reports asking for 1:1s are higher than they look — flight-risk signal hides in those.
- A pattern flagged by a product or CS lead ("I'm seeing the same ask 5 times this week") is medium priority but worth surfacing — it's how systems get fixed.

OUTPUT FORMAT:

Return valid JSON only:
{
  "score": 0-100,
  "needs_ryan": true/false,
  "reasoning": "1-2 sentence explanation. For internal items, specifically address why this needs (or doesn't need) Ryan vs. someone else."
}

Make the reasoning useful — it appears in Ryan's dashboard."""


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
