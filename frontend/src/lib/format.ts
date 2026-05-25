import type { Channel, EmailCategory, SuggestedAction } from "./types";

// Category labels and visual tints. External uses a warm-ish palette
// (greens / ambers / violets) and internal leans cool (blues / indigos /
// teals) so the source distinction reads at a glance — the v2 scope's
// "blue family for internal" cue. Two outliers by design:
//   - internal_escalation stays rose because "someone is blocked" should
//     punch harder than its source family.
//   - internal_fyi is a very low-contrast slate so it visually recedes.
export const CATEGORY_LABEL: Record<EmailCategory, string> = {
  // external
  sales_inquiry: "Sales",
  customer_support: "Support",
  renewal_expansion: "Renewal",
  vendor_pitch: "Vendor pitch",
  recruiting: "Recruiting",
  noise: "Noise",
  edge_case: "Edge case",
  // internal
  eng_decision: "Eng decision",
  internal_escalation: "Escalation",
  direct_report_request: "Direct report",
  board_communication: "Board",
  finance_decision: "Finance",
  hr_decision: "HR",
  internal_fyi: "FYI",
};

export const CATEGORY_TINT: Record<EmailCategory, string> = {
  // external — warm tones
  sales_inquiry: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  customer_support: "bg-amber-50 text-amber-800 ring-amber-200",
  renewal_expansion: "bg-violet-50 text-violet-700 ring-violet-200",
  vendor_pitch: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  recruiting: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  noise: "bg-zinc-50 text-zinc-500 ring-zinc-200",
  edge_case: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  // internal — cool tones, with escalation as a deliberate exception
  eng_decision: "bg-blue-50 text-blue-700 ring-blue-200",
  internal_escalation: "bg-rose-50 text-rose-700 ring-rose-200",
  direct_report_request: "bg-teal-50 text-teal-700 ring-teal-200",
  board_communication: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  finance_decision: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  hr_decision: "bg-purple-50 text-purple-700 ring-purple-200",
  internal_fyi: "bg-slate-50 text-slate-500 ring-slate-200",
};

export const ACTION_LABEL: Record<SuggestedAction, string> = {
  personal_response_from_ryan: "Ryan responds",
  draft_for_ryan_review: "Review draft",
  delegate_to_bdr: "Delegate → BDR",
  delegate_to_cs: "Delegate → CS",
  delegate_to_recruiter: "Delegate → Recruiter",
  auto_archive: "Auto-archive",
  flag_to_engineering: "Flag → Eng",
  schedule_meeting: "Schedule meeting",
};

export const ACTION_TINT: Record<SuggestedAction, string> = {
  personal_response_from_ryan: "bg-rose-50 text-rose-700 ring-rose-200",
  draft_for_ryan_review: "bg-blue-50 text-blue-700 ring-blue-200",
  delegate_to_bdr: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  delegate_to_cs: "bg-amber-50 text-amber-800 ring-amber-200",
  delegate_to_recruiter: "bg-sky-50 text-sky-700 ring-sky-200",
  auto_archive: "bg-zinc-50 text-zinc-500 ring-zinc-200",
  flag_to_engineering: "bg-violet-50 text-violet-700 ring-violet-200",
  schedule_meeting: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

// Rough per-action time estimate (minutes). Used by the queue summary to
// surface "Est. ~45 min" without inventing a new pipeline field. The
// numbers are deliberately humble: the right read is "is this a half hour
// or two hours", not "I have 47 minutes of work."
export const ACTION_MINUTES: Record<SuggestedAction, number> = {
  personal_response_from_ryan: 6,
  draft_for_ryan_review: 3,
  delegate_to_bdr: 1,
  delegate_to_cs: 1,
  delegate_to_recruiter: 1,
  auto_archive: 0,
  flag_to_engineering: 1,
  schedule_meeting: 2,
};

export const CHANNEL_LABEL: Record<Channel, string> = {
  slack: "Slack",
  internal_email: "Internal email",
};

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function humanizeFieldKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function senderInitials(name: string | null, address: string): string {
  const base = name?.trim() || address.split("@")[0] || "?";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}
