// Types mirror the Pydantic models in backend/app/models.py and the
// triage_inbox view defined in backend/schema.sql. Keep these in sync.

export type EmailCategory =
  | "sales_inquiry"
  | "customer_support"
  | "renewal_expansion"
  | "vendor_pitch"
  | "recruiting"
  | "noise"
  | "edge_case";

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
export interface TriagedEmail {
  email_id: string;
  gmail_message_id: string;
  from_address: string;
  from_name: string | null;
  subject: string | null;
  body: string | null;
  received_at: string; // ISO timestamp

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
}

export interface FeedbackPayload {
  classification_correct: boolean;
  correct_category?: EmailCategory | null;
  response_quality?: number | null;
  priority_correct?: boolean | null;
  notes?: string | null;
  reviewed_by?: string;
}
