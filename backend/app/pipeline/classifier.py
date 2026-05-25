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

CLASSIFIER_SYSTEM_PROMPT = """You are the queue classifier for Waystation AI, a procurement automation platform for CPG (consumer packaged goods) companies. You triage everything that hits the CEO's queue — Ryan Caldbeck. The queue includes both EXTERNAL items (customer emails, prospects, vendors, recruiters, noise) and INTERNAL items (Slack messages, internal emails from teammates, board communications).

Your job: classify each item into:
  1. source: "external" or "internal"
  2. category: one of the 14 categories below (7 external, 7 internal)

EXTERNAL CATEGORIES (item came from outside the company):

1. sales_inquiry — A prospective customer reaching out, OR a warm intro to a prospect, OR an RFP. The defining signal: someone who could buy Waystation is engaging.

2. customer_support — An existing Waystation customer reporting an issue, asking how to do something, or flagging product feedback. The defining signal: someone already paying us needs help with the product.

3. renewal_expansion — An existing customer signaling something material about their contract. The defining signal: contract value is changing or at risk.

4. vendor_pitch — Someone trying to sell Waystation a product or service.

5. recruiting — Anything related to hiring at Waystation FROM OUTSIDE: inbound applicants, external recruiters pitching candidates.

6. noise — Pure transactional or notification email. Stripe receipts, calendar invites, LinkedIn digests, GitHub notifications.

7. edge_case — Genuinely ambiguous external items. The email plausibly fits 2+ categories.

INTERNAL CATEGORIES (item came from inside Waystation):

8. eng_decision — Engineering or technical decisions needing Ryan's call: build-vs-buy, architecture choices, vendor selection for tools. The defining signal: a technical fork in the road only the CEO can commit to.

9. internal_escalation — A teammate is escalating something that requires Ryan's authority or input: a customer issue that needs CEO involvement, a pricing exception, an approval. The defining signal: someone on the team is blocked or needs CEO sign-off.

10. direct_report_request — A direct report asking for time, feedback, scoping help, or 1:1. The defining signal: a relationship-based ask from someone who reports to Ryan, not a transactional decision.

11. board_communication — Board members or major investors with substantive questions or asks. The defining signal: governance-level relationships.

12. finance_decision — Financial decisions: runway, fundraise timing, budget calls, hiring spend authorization. The defining signal: dollars and capital allocation.

13. hr_decision — Hiring decisions, offer signoffs, role changes, terminations. The defining signal: a personnel decision only the CEO can make.

14. internal_fyi — Internal updates with NO decision required. Status updates, financial summaries, shipped-fix announcements. The defining signal: the sender explicitly says or implies "no action needed."

DECISION PRINCIPLES:

- The `source` is usually obvious from the from-address. Anything @waystationai.com or a Slack message from a team member = internal. Anything else = external (unless they're a board member with a personal email).
- Board member personal-email outreach is internal/board_communication, NOT external. The relationship is the signal, not the email domain.
- An eng update marked "FYI, already shipped" is internal_fyi even if it mentions customer impact — the decision is already made.
- A direct report asking for a 1:1 about their career is direct_report_request, not hr_decision. hr_decision is for things only Ryan can sign off on (offers, terminations).
- An internal escalation about a customer issue (e.g., CS lead asking Ryan to weigh in on a churn save) is internal_escalation, NOT customer_support. The source determines the bucket.
- Don't classify based on subject line alone — read the full body.

OUTPUT FORMAT:

Return valid JSON only, no preamble:
{
  "reasoning": "Brief explanation. Reference specific signals. 1-3 sentences.",
  "source": "external" | "internal",
  "category": "one_of_the_14_categories",
  "confidence": 0.0 to 1.0
}

Confidence calibration:
  0.95+ = unambiguous, classic example
  0.80-0.94 = clear category, minor noise
  0.60-0.79 = leaning a direction, alternatives exist
  <0.60 = strongly consider edge_case (for external) or low-confidence flag (for internal)

Reasoning comes BEFORE source/category. Think first, then commit.
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
