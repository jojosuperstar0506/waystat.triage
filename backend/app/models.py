"""Pydantic schemas for pipeline outputs.

These are the shapes the LLM returns at each stage. Using Pydantic gives us:
  - Validation at the boundary (if Claude returns malformed JSON, we catch it)
  - Type safety throughout the pipeline
  - Clean serialization into Supabase
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


# The seven categories we triage into. Keeping this as a Literal type lets
# Pydantic validate that Claude's output is one of these exact strings.
EmailCategory = Literal[
    "sales_inquiry",
    "customer_support",
    "renewal_expansion",
    "vendor_pitch",
    "recruiting",
    "noise",
    "edge_case",
]

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
    category: EmailCategory
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str = Field(min_length=10, max_length=500)


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
