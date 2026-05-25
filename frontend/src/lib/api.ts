import type { FeedbackPayload, TriagedEmail } from "./types";
import { MOCK_INBOX } from "./mock-data";

// Server-side base URL for the FastAPI backend. If unset, the dashboard
// falls back to bundled mock data so the UI can be demoed standalone.
function backendUrl(): string | null {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  return url ? url.replace(/\/$/, "") : null;
}

export interface FetchInboxResult {
  emails: TriagedEmail[];
  source: "api" | "mock";
  error?: string;
}

export async function fetchInbox(limit = 100): Promise<FetchInboxResult> {
  const base = backendUrl();
  if (!base) {
    return { emails: MOCK_INBOX, source: "mock" };
  }

  try {
    const res = await fetch(`${base}/inbox?limit=${limit}`, {
      // Triage data is mutable (feedback writes change `classification_correct` etc.),
      // so we never want a stale cache here.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }
    const json = (await res.json()) as { emails: TriagedEmail[] };
    return { emails: json.emails, source: "api" };
  } catch (e) {
    return {
      emails: MOCK_INBOX,
      source: "mock",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function submitFeedback(
  emailId: string,
  payload: FeedbackPayload,
): Promise<{ ok: boolean; error?: string }> {
  const base = backendUrl();
  if (!base) {
    // Demo mode: pretend it worked. Real implementations should fail loudly,
    // but here we want the UI flow to be exercisable without a backend.
    return { ok: true };
  }
  try {
    const res = await fetch(`${base}/feedback/${encodeURIComponent(emailId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `Backend returned ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
