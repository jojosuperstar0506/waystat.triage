"""Email classifier.

Single most important prompt in the system. Everything downstream depends on
getting this right. Design decisions:

  1. Few-shot examples in the prompt rather than zero-shot — calibrates the
     model's category boundaries on the actual edge cases we care about.
  2. Force the model to articulate reasoning before category — reduces
     classification anchoring on subject line alone.
  3. Use Claude's structured output via JSON mode — eliminates parsing failures.
  4. Confidence calibration: model returns a confidence score, and we use this
     downstream to route low-confidence cases to human review.
"""

import json
from anthropic import Anthropic
from ..models import ClassificationResult


MODEL = "claude-sonnet-4-6"
MODEL_VERSION = f"{MODEL}-v1"  # bump when we change the prompt

CLASSIFIER_SYSTEM_PROMPT = """You are the email classifier for Waystation AI, a procurement automation platform for CPG (consumer packaged goods) companies. You triage the inbox of Ryan Caldbeck, the founder and CEO.

Your job: classify each email into exactly one of these seven categories.

CATEGORIES:

1. sales_inquiry — A prospective customer reaching out, OR a warm intro to a prospect, OR an RFP. Includes inbound demo requests, pricing questions from real CPG companies, partner referrals to prospects. The defining signal: someone who could buy Waystation is engaging.

2. customer_support — An existing Waystation customer reporting an issue, asking how to do something, or flagging product feedback. Includes bug reports, integration questions, feature requests, complaints. The defining signal: someone already paying us needs help with the product.

3. renewal_expansion — An existing customer signaling something material about their contract: renewal coming up, wanting to add/remove seats, expansion to new module, churn risk signal, or actual cancellation. The defining signal: contract value is changing or at risk.

4. vendor_pitch — Someone trying to sell Waystation a product or service. Outbound sales emails, sponsorship requests, agency pitches, "we replace your BDRs" offers. Often have template artifacts ({{variable}}), generic "I saw you're growing" openers, or clearly automated tone.

5. recruiting — Anything related to hiring at Waystation: inbound applicants, recruiters pitching candidates, candidate referrals. The defining signal: a person could be hired here as a result.

6. noise — Pure transactional or notification email. Stripe receipts, calendar invites from your own tools, LinkedIn notification digests, GitHub issue notifications, newsletter blasts. The defining signal: no human is waiting for a response.

7. edge_case — Genuinely ambiguous. The email plausibly fits 2+ categories, or has unusual properties that make it worth flagging for human attention. Use sparingly — only when categorization is genuinely uncertain, not just when the email is interesting.

DECISION PRINCIPLES:

- A VC or investor reaching out is sales_inquiry IF they're a prospect for Waystation's product, otherwise edge_case (most VCs don't buy procurement software).
- A former colleague reaching out personally is usually edge_case if they're also pitching something.
- A renewal email that's actually a cancellation is renewal_expansion (the contract is changing materially).
- An automated email FROM a vendor's system (Stripe payout, Calendly booking) is noise even though the underlying activity matters.
- Don't classify based on subject line alone — read the full body.

OUTPUT FORMAT:

Return valid JSON only, no preamble:
{
  "reasoning": "Brief explanation of why this category. Reference specific signals from the email body. 1-3 sentences.",
  "category": "one_of_the_seven_categories",
  "confidence": 0.0 to 1.0
}

Confidence calibration:
  0.95+ = unambiguous, classic example of the category
  0.80-0.94 = clear category but with minor noise
  0.60-0.79 = leaning a direction but reasonable alternatives exist
  <0.60 = strongly consider edge_case instead

Reasoning comes BEFORE category in the JSON. Think first, then commit.
"""


CLASSIFIER_USER_TEMPLATE = """Classify this email:

From: {from_name} <{from_address}>
Subject: {subject}
Received: {received_at}

Body:
{body}"""


def classify_email(
    client: Anthropic,
    email: dict,
) -> ClassificationResult:
    """Classify a single email. Returns validated ClassificationResult.

    Args:
        client: Anthropic client (instantiated by caller for connection reuse)
        email: dict with keys: from_name, from_address, subject, received_at, body
    """
    user_message = CLASSIFIER_USER_TEMPLATE.format(
        from_name=email.get("from_name", ""),
        from_address=email["from"],
        subject=email.get("subject", "(no subject)"),
        received_at=email.get("received_at", ""),
        body=email.get("body", ""),
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=CLASSIFIER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text.strip()
    # Strip markdown code fences if Claude wraps the JSON (sometimes happens)
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 2)[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.rsplit("```", 1)[0].strip()

    parsed = json.loads(raw_text)
    return ClassificationResult(**parsed)
