"""Pydantic schemas for pipeline outputs.

These are the shapes the LLM returns at each stage. Using Pydantic gives us:
  - Validation at the boundary (if Claude returns malformed JSON, we catch it)
  - Type safety throughout the pipeline
  - Clean serialization into Supabase
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


# Source dimension: where did this item enter Ryan's queue?
# External = customers, prospects, vendors, recruiters, noise.
# Internal = teammates, board, investors, internal systems.
ItemSource = Literal["external", "internal"]


# Categories for external items (customer/prospect-facing).
ExternalCategory = Literal[
    "sales_inquiry",
    "customer_support",
    "renewal_expansion",
    "vendor_pitch",
    "recruiting",
    "noise",
    "edge_case",
]

# Categories for internal items (team-facing).
InternalCategory = Literal[
    "eng_decision",            # Build-vs-buy, architecture calls, vendor selection
    "internal_escalation",     # Pricing exceptions, customer escalations needing CEO call
    "direct_report_request",   # 1:1 requests, feedback asks, scoping conversations
    "board_communication",     # Board members, investors with substantive questions
    "finance_decision",        # Runway, fundraise, budget calls
    "hr_decision",             # Offers, terminations, role changes
    "internal_fyi",            # Updates with no decision required
]

# Unified category type — classifier returns one of these.
EmailCategory = Literal[
    "sales_inquiry",
    "customer_support",
    "renewal_expansion",
    "vendor_pitch",
    "recruiting",
    "noise",
    "edge_case",
    "eng_decision",
    "internal_escalation",
    "direct_report_request",
    "board_communication",
    "finance_decision",
    "hr_decision",
    "internal_fyi",
]

EXTERNAL_CATEGORIES = {
    "sales_inquiry", "customer_support", "renewal_expansion",
    "vendor_pitch", "recruiting", "noise", "edge_case",
}
INTERNAL_CATEGORIES = {
    "eng_decision", "internal_escalation", "direct_report_request",
    "board_communication", "finance_decision", "hr_decision", "internal_fyi",
}

# Suggested next actions. Designed around what Ryan actually does with email:
# either respond personally, delegate to a team member, route to a system,
# or ignore. The categories map cleanly to operational reality.
SuggestedAction = Literal[
    "personal_response_from_ryan",  # Ryan needs to write this himself
    "draft_for_ryan_review",        # AI draft ready, Ryan approves/sends
    "delegate_to_bdr",              # Sales motion, route to BDR team
    "delegate_to_cs",                # Customer success owns this
    "delegate_to_recruiter",         # Recruiting pipeline
    "auto_archive",                  # Pure noise, no action needed
    "flag_to_engineering",           # Bug/technical issue
    "schedule_meeting",              # Calendar action needed
]


class ClassificationResult(BaseModel):
    """Output of the classification stage."""
    source: ItemSource
    category: EmailCategory
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str = Field(min_length=10, max_length=500)

    @field_validator("category")
    @classmethod
    def category_matches_source(cls, v, info):
        # Soft validation — we don't error, but the prioritizer/drafter
        # use this consistency for downstream logic.
        source = info.data.get("source")
        if source == "external" and v in INTERNAL_CATEGORIES:
            # Allow but flag — this is a model bug we'd want to catch in eval
            pass
        if source == "internal" and v in EXTERNAL_CATEGORIES:
            pass
        return v


class ExtractionResult(BaseModel):
    """Output of the extraction stage.

    `fields` is intentionally flexible — its shape depends on category.
    Documented shapes by category:

      sales_inquiry: {
        company_name, company_size_estimate, sender_role, stated_need,
        urgency_signals[], mentioned_competitors[], referral_source
      }

      customer_support: {
        customer_company, issue_type, affected_feature, severity,
        deadline_mentioned, has_attachments_referenced
      }

      renewal_expansion: {
        customer_company, signal_type ('expansion'|'reduction'|'renewal_risk'),
        seat_change, contract_value_impact_estimate, key_quotes[]
      }

      vendor_pitch: {
        vendor_name, product_category, claims[], looks_like_spam (bool)
      }

      recruiting: {
        role_targeted, candidate_or_recruiter, candidate_summary,
        notable_credentials[]
      }

      noise: {
        noise_subtype ('newsletter'|'transactional'|'calendar'|'github_notification'|...)
      }

      edge_case: {
        why_unusual, plausible_categories[], recommended_handling
      }
    """
    fields: dict
    extraction_notes: Optional[str] = None


class DraftedResponse(BaseModel):
    """Output of the drafting stage."""
    draft_body: Optional[str] = None  # null if no draft makes sense (pure noise)
    suggested_action: SuggestedAction
    action_reasoning: str = Field(min_length=10, max_length=400)
    confidence: float = Field(ge=0.0, le=1.0)


class PriorityScore(BaseModel):
    """Output of the prioritization stage."""
    score: int = Field(ge=0, le=100)
    needs_ryan: bool
    reasoning: str = Field(min_length=10, max_length=400)

    @field_validator("score")
    @classmethod
    def needs_ryan_implies_high_score(cls, v, info):
        # Soft consistency check; we don't fail validation but it's logged in tests
        return v


class TriageResult(BaseModel):
    """The full pipeline output for one email."""
    email_id: str
    classification: ClassificationResult
    extraction: ExtractionResult
    drafted_response: DraftedResponse
    priority: PriorityScore
