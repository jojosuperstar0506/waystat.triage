"""Response drafter + action suggester.

Takes the email and its extracted fields, and produces:
  1. A drafted response (where appropriate) — Ryan reviews and sends
  2. A suggested action — what should happen with this email

Design note: we explicitly do NOT auto-send. The human-in-the-loop is the
product, not a limitation. Even for "noise" we suggest auto_archive but don't
take the action — Ryan or the BizOps person reviews the queue.

Tone matters here. Ryan's voice on email is direct, warm, signed "Ryan". We
prompt the model with examples of his style to keep drafts in voice.
"""

import json
from anthropic import Anthropic
from ..models import DraftedResponse


MODEL = "claude-sonnet-4-6"
MODEL_VERSION = f"{MODEL}-drafter-v1"


DRAFTER_SYSTEM_PROMPT = """You draft email responses and suggest next actions for Ryan Caldbeck (founder/CEO of Waystation AI).

RYAN'S VOICE:
- Direct, warm, concise. Signs emails as "Ryan" — no "Best regards" or "Sincerely"
- Personal touch on important emails. References the specific thing the sender said.
- Doesn't overpromise. If a question requires research or context he doesn't have, says so.
- Uses lowercase informally with friends/familiar contacts, normal capitalization with prospects/customers
- Short paragraphs. Whitespace. No corporate-speak.

WHEN TO DRAFT vs. WHEN TO SUGGEST DELEGATION:

- sales_inquiry from a hot lead (specific need, fit, urgency): DRAFT a personal response from Ryan. He'll review and send.
- sales_inquiry from a lukewarm lead: suggest "delegate_to_bdr" with a short note for the BDR.
- customer_support routine issue: suggest "delegate_to_cs" with a draft for the CS person.
- customer_support from a top customer or with churn risk language: DRAFT for Ryan, suggest "draft_for_ryan_review".
- renewal_expansion (especially churn risk or reduction): always "personal_response_from_ryan" — these are too important to delegate. Do NOT draft a response; this needs Ryan's actual thinking and is not something to template.
- vendor_pitch: suggest "auto_archive". If genuinely interesting and relevant, suggest "draft_for_ryan_review" with a short polite decline or a "tell me more" depending on fit.
- recruiting from a strong-looking candidate: suggest "delegate_to_recruiter" and draft a brief intro response Ryan could send personally.
- noise: suggest "auto_archive". No draft needed.
- edge_case: suggest "personal_response_from_ryan". No draft — Ryan needs to think about this one.
- bug reports / system issues: suggest "flag_to_engineering". Optionally draft a short "we're on it" reply.
- demo/meeting scheduling needed: suggest "schedule_meeting" with a draft.

DRAFTING PRINCIPLES:
- Reference something specific from their email so they know it was actually read
- For sales, ask a question that advances the deal (next step, scheduling, qualifying detail)
- For support, acknowledge the issue and give a real next step (not "we'll get back to you")
- For renewals/churn, never write a draft — flag for Ryan
- Keep drafts under 100 words unless the situation genuinely requires more

OUTPUT FORMAT:

Return valid JSON only:
{
  "draft_body": "the email draft, or null if no draft is appropriate",
  "suggested_action": "one of the action enum values",
  "action_reasoning": "1-2 sentences on why this action",
  "confidence": 0.0 to 1.0
}

The action_reasoning is what shows up in Ryan's dashboard. Make it useful — explain the *why* concisely, not the *what*."""


VALID_ACTIONS = {
    "personal_response_from_ryan",
    "draft_for_ryan_review",
    "delegate_to_bdr",
    "delegate_to_cs",
    "delegate_to_recruiter",
    "auto_archive",
    "flag_to_engineering",
    "schedule_meeting",
}


def draft_response(
    client: Anthropic,
    email: dict,
    category: str,
    extracted_fields: dict,
) -> DraftedResponse:
    """Draft a response and suggest a next action."""
    user_message = f"""Category: {category}

Extracted fields:
{json.dumps(extracted_fields, indent=2)}

ORIGINAL EMAIL:
From: {email.get('from_name', '')} <{email['from']}>
Subject: {email.get('subject', '(no subject)')}
Body:
{email.get('body', '')}

Draft a response (or null) and suggest an action. Return JSON only."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=900,
        system=DRAFTER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 2)[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.rsplit("```", 1)[0].strip()

    parsed = json.loads(raw_text)

    # Validate suggested_action against our enum
    if parsed.get("suggested_action") not in VALID_ACTIONS:
        # Fall back gracefully — log this in production
        parsed["suggested_action"] = "draft_for_ryan_review"
        parsed["action_reasoning"] = (
            f"[Auto-correction: model returned invalid action] "
            + parsed.get("action_reasoning", "")
        )

    return DraftedResponse(**parsed)
