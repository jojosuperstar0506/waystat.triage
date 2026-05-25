"""Pipeline package."""
from .classifier import classify_email
from .extractor import extract_fields
from .drafter import draft_response
from .prioritizer import score_priority

__all__ = ["classify_email", "extract_fields", "draft_response", "score_priority"]
