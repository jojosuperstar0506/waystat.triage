"""Field extractor.

Takes a classified email and extracts the structured fields that matter for
that category. The shape of `fields` varies by category — see models.py for
the documented shapes.

Design note: we use a single extractor prompt with category-specific
instructions injected, rather than seven separate prompts. This keeps the
prompt-management surface area small and makes adding/modifying categories
cheap. The tradeoff is slightly less specialized prompts per category, but
the LLM handles this well at the model tier we're using.
"""

import json
from anthropic import Anthropic
from ..models import ExtractionResult


MODEL = "claude-sonnet-4-6"
MODEL_VERSION = f"{MODEL}-extractor-v1"


CATEGORY_EXTRACTION_GUIDES = {
    "sales_inquiry": """Extract these fields:
  - company_name: the prospect's company
  - company_size_estimate: revenue range if mentioned, or null
  - sender_role: their title or implied role
  - stated_need: what problem are they trying to solve (1 sentence)
  - urgency_signals: array of phrases indicating urgency or timeline
  - mentioned_competitors: array of competing tools they've evaluated
  - referral_source: how they found Waystation (person, podcast, post, etc.) or null
  - lead_quality: "hot" | "warm" | "cold" — your judgment based on fit, urgency, and specificity""",

    "customer_support": """Extract these fields:
  - customer_company: the customer's company
  - issue_type: "bug" | "feature_request" | "how_to_question" | "integration_issue" | "data_quality"
  - affected_feature: which part of the product (COA extraction, dashboard, comparison view, API, etc.)
  - severity: "blocker" | "high" | "medium" | "low" — based on impact described
  - deadline_mentioned: any deadline that creates urgency, or null
  - sentiment: "frustrated" | "neutral" | "positive" — tone of the email
  - has_attachments_referenced: true if email mentions attachments/screenshots""",

    "renewal_expansion": """Extract these fields:
  - customer_company: the customer's company
  - signal_type: "expansion" | "reduction" | "renewal_risk" | "churn" | "routine_renewal"
  - seat_change: number of seats being added (positive) or removed (negative), or null
  - contract_value_impact: "positive" | "negative" | "neutral" | "unknown"
  - renewal_date_mentioned: date if mentioned, or null
  - key_quotes: array of 1-2 short quotes that capture the core signal
  - churn_risk_level: "high" | "medium" | "low" | "none" — only relevant for renewal_risk/churn signals""",

    "vendor_pitch": """Extract these fields:
  - vendor_name: company doing the pitching
  - product_category: what they sell (outbound automation, BI tool, agency, etc.)
  - claims: array of specific claims they make (e.g. "5000 emails/day", "replace BDRs")
  - looks_like_spam: true if template artifacts ({{variables}}), generic openers, or mass-mail signals are present
  - relevant_to_waystation: true if this is genuinely something Ryan might evaluate, false if obviously off-base""",

    "recruiting": """Extract these fields:
  - inbound_type: "applicant" | "recruiter_pitch" | "referral"
  - role_targeted: which role they're applying to or pitching for
  - candidate_summary: 1 sentence on the candidate (the applicant themselves, or who the recruiter is pitching)
  - notable_credentials: array of credentials that stand out (employers, schools, achievements)
  - has_relevant_domain_experience: true if CPG, supply chain, procurement, or AI-procurement background""",

    "noise": """Extract these fields:
  - noise_subtype: "newsletter" | "transactional_receipt" | "calendar_notification" | "github_notification" | "platform_notification" | "promotional_blast"
  - sender_system: the platform/service that sent this (Stripe, LinkedIn, Calendly, etc.)
  - safe_to_archive: true (almost always true for noise)""",

    "edge_case": """Extract these fields:
  - why_unusual: 1-2 sentence explanation of why this email is hard to categorize
  - plausible_categories: array of the 2-3 categories this could plausibly belong to
  - recommended_handling: 1 sentence on how Ryan should think about this
  - has_personal_dimension: true if the email involves a personal relationship (former colleague, friend, etc.) mixed with business""",
}


EXTRACTOR_SYSTEM_PROMPT = """You are the field extractor for Waystation AI's email triage system. You take an email that has already been classified into a category, and extract the structured fields relevant to that category.

Be precise. Extract what's actually in the email — do not invent. If a field isn't present, return null. If a list field has no items, return an empty array.

Return valid JSON only. The output should be a single JSON object with a "fields" key containing the extracted structured data, and optionally an "extraction_notes" key with anything notable about the extraction (e.g. ambiguity, missing context)."""


def extract_fields(
    client: Anthropic,
    email: dict,
    category: str,
) -> ExtractionResult:
    """Extract structured fields from an email given its classification.

    Args:
        client: Anthropic client
        email: email dict (same shape as classifier input)
        category: the classified category, e.g. "sales_inquiry"
    """
    extraction_guide = CATEGORY_EXTRACTION_GUIDES.get(
        category,
        "Extract any structured fields that seem relevant to this email."
    )

    user_message = f"""This email has been classified as: {category}

{extraction_guide}

EMAIL:
From: {email.get('from_name', '')} <{email['from']}>
Subject: {email.get('subject', '(no subject)')}
Body:
{email.get('body', '')}

Return JSON:
{{
  "fields": {{ ... extracted fields per the guide above ... }},
  "extraction_notes": "optional notes or null"
}}"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=800,
        system=EXTRACTOR_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_text = response.content[0].text.strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```", 2)[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.rsplit("```", 1)[0].strip()

    parsed = json.loads(raw_text)
    return ExtractionResult(**parsed)
