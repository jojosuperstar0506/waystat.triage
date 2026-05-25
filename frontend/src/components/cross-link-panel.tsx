"use client";

import { Link2 } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { SourceMarker } from "@/components/source-marker";
import { sourceOf } from "@/lib/triage-utils";
import type { TriagedEmail } from "@/lib/types";

interface CrossLinkPanelProps {
  email: TriagedEmail;
  allEmails: TriagedEmail[];
  onSelect: (emailId: string) => void;
}

// Surfaces the BizOps signal: this item is connected to another in the
// queue. The link is currently hand-curated on each row (see
// `linked_items` in mock-data.ts and docs/open_questions.md #2) — a real
// implementation would emit this from the backend's prioritizer when it
// notices entity overlap (same customer, same person, same project).
export function CrossLinkPanel({ email, allEmails, onSelect }: CrossLinkPanelProps) {
  const linkIds = email.linked_items ?? [];
  if (linkIds.length === 0) return null;

  // Map from gmail_message_id (e.g. "email_018") back to the row that
  // carries it. Items not present in the current queue are silently
  // skipped — happens if a linked item is older than the queue window.
  const byMessageId = new Map(allEmails.map((e) => [e.gmail_message_id, e]));
  const linked = linkIds
    .map((id) => byMessageId.get(id))
    .filter((e): e is TriagedEmail => e != null);

  if (linked.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50/40">
      <div className="flex items-center gap-1.5 border-b border-indigo-200 bg-indigo-50/80 px-4 py-2">
        <Link2 className="h-3.5 w-3.5 text-indigo-700" />
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
          Connected in your queue
        </span>
      </div>
      <ul className="divide-y divide-indigo-100">
        {linked.map((rel) => (
          <li key={rel.email_id}>
            <button
              onClick={() => onSelect(rel.email_id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-indigo-50/60"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-zinc-600 ring-1 ring-zinc-200">
                <SourceMarker
                  source={sourceOf(rel)}
                  channel={rel.channel}
                  size="sm"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-900">
                  {rel.from_name ?? rel.from_address}
                  <span className="ml-2 font-normal text-zinc-500">
                    {rel.subject ?? "(no subject)"}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <CategoryBadge category={rel.category} />
                  {rel.priority_score != null && (
                    <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                      priority {rel.priority_score}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
