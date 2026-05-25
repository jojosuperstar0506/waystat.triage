import type { EmailCategory, SuggestedAction } from "./types";

export const CATEGORY_LABEL: Record<EmailCategory, string> = {
  sales_inquiry: "Sales",
  customer_support: "Support",
  renewal_expansion: "Renewal",
  vendor_pitch: "Vendor pitch",
  recruiting: "Recruiting",
  noise: "Noise",
  edge_case: "Edge case",
};

export const CATEGORY_TINT: Record<EmailCategory, string> = {
  sales_inquiry: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  customer_support: "bg-amber-50 text-amber-800 ring-amber-200",
  renewal_expansion: "bg-violet-50 text-violet-700 ring-violet-200",
  vendor_pitch: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  recruiting: "bg-sky-50 text-sky-700 ring-sky-200",
  noise: "bg-zinc-50 text-zinc-500 ring-zinc-200",
  edge_case: "bg-rose-50 text-rose-700 ring-rose-200",
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
