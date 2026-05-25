// Types mirror the Pydantic models in backend/app/models.py and the
// triage_inbox view defined in backend/schema.sql. Keep these in sync.

export type ItemSource = "external" | "internal";

export type ExternalCategory =
  | "sales_inquiry"
  | "customer_support"
  | "renewal_expansion"
  | "vendor_pitch"
  | "recruiting"
  | "noise"
  | "edge_case";

export type InternalCategory =
  | "eng_decision"
  | "internal_escalation"
  | "direct_report_request"
  | "board_communication"
  | "finance_decision"
  | "hr_decision"
  | "internal_fyi";

export type EmailCategory = ExternalCategory | InternalCategory;

export const EXTERNAL_CATEGORIES: ExternalCategory[] = [
  "sales_inquiry",
  "customer_support",
  "renewal_expansion",
  "vendor_pitch",
  "recruiting",
  "noise",
  "edge_case",
];

export const INTERNAL_CATEGORIES: InternalCategory[] = [
  "eng_decision",
  "internal_escalation",
  "direct_report_request",
  "board_communication",
  "finance_decision",
  "hr_decision",
  "internal_fyi",
];

export function isInternalCategory(c: EmailCategory | null): c is InternalCategory {
  return c != null && (INTERNAL_CATEGORIES as string[]).includes(c);
}

export type Channel = "slack" | "internal_email";

export type SuggestedAction =
  | "personal_response_from_ryan"
  | "draft_for_ryan_review"
  | "delegate_to_bdr"
  | "delegate_to_cs"
  | "delegate_to_recruiter"
  | "auto_archive"
  | "flag_to_engineering"
  | "schedule_meeting";

// One row from the `triage_inbox` Supabase view — what `GET /inbox` returns.
// `source`, `channel`, and `from_role` were added in the v2 scope and are
// optional on the type so pre-v2 fixtures still type-check; the rendering
// layer treats missing `source` as "external".
export interface TriagedEmail {
  email_id: string;
  gmail_message_id: string;
  from_address: string;
  from_name: string | null;
  subject: string | null;
  body: string | null;
  received_at: string;

  source?: ItemSource;
  channel?: Channel | null;
  from_role?: string | null;

  category: EmailCategory | null;
  classification_confidence: number | null;
  classification_reasoning: string | null;

  extracted_fields: Record<string, unknown> | null;

  draft_body: string | null;
  suggested_action: SuggestedAction | null;
  action_reasoning: string | null;

  priority_score: number | null;
  needs_ryan: boolean | null;
  priority_reasoning: string | null;

  classification_correct: boolean | null;
  response_quality: number | null;
  priority_correct: boolean | null;

  // Demo-only: hand-curated cross-source links until the backend linker
  // ships. Each entry is another row's `gmail_message_id` (e.g. "email_018").
  linked_items?: string[];
}

export interface FeedbackPayload {
  classification_correct: boolean;
  correct_category?: EmailCategory | null;
  response_quality?: number | null;
  priority_correct?: boolean | null;
  notes?: string | null;
  reviewed_by?: string;
}
