"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { ChannelChip } from "@/components/channel-chip";
import { PriorityPill } from "@/components/priority-pill";
import { SourceMarker } from "@/components/source-marker";
import { formatRelativeTime, senderInitials } from "@/lib/format";
import { sourceOf, splitSubjectPrefix } from "@/lib/triage-utils";
import { isInternalCategory, type TriagedEmail } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InboxListProps {
  emails: TriagedEmail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InboxList({ emails, selectedId, onSelect }: InboxListProps) {
  // Compute relative timestamps on the client only so the SSR and hydration
  // passes don't produce different strings ("1m ago" vs "2m ago").
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (emails.length === 0) {
    return <EmptyState />;
  }
  return (
    <ul className="divide-y divide-zinc-100">
      {emails.map((email) => {
        const selected = email.email_id === selectedId;
        const needsRyan = email.needs_ryan === true;
        const source = sourceOf(email);
        const isInternal = source === "internal";
        // Per docs/open_questions.md #8: internal_fyi recedes via softer
        // text + no avatar tint, not via opacity-60 (which reads broken).
        const isFyi = email.category === "internal_fyi";
        const { tag, subject } = splitSubjectPrefix(email.subject);
        // Drop the channel prefix tag when the channel is Slack (we render
        // it as a chip instead). For non-Slack items, keep whatever prefix
        // the subject had.
        const cleanedSubject = email.channel === "slack" ? subject : email.subject ?? "(no subject)";

        return (
          <li key={email.email_id} className="relative">
            {/* Left border accent: red if needs_ryan, blue if internal, transparent otherwise.
                Needs_ryan wins over internal because "blocked" is louder than "source". */}
            <span
              className={cn(
                "absolute inset-y-0 left-0 w-[3px]",
                needsRyan
                  ? "bg-rose-500"
                  : isInternal
                    ? "bg-blue-400"
                    : "bg-transparent",
              )}
              aria-hidden
            />
            <button
              onClick={() => onSelect(email.email_id)}
              className={cn(
                "group flex w-full gap-3 px-4 py-3 pl-[15px] text-left transition-colors",
                selected ? "bg-zinc-100" : "hover:bg-zinc-50",
              )}
            >
              <div className="relative mt-0.5 shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                    isFyi
                      ? "bg-zinc-50 text-zinc-400"
                      : needsRyan
                        ? "bg-rose-100 text-rose-700"
                        : isInternal
                          ? "bg-blue-50 text-blue-700"
                          : "bg-zinc-100 text-zinc-600",
                  )}
                >
                  {senderInitials(email.from_name, email.from_address)}
                </div>
                {/* Tiny source/channel glyph in the corner of the avatar */}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-zinc-500 ring-1",
                    isInternal ? "ring-blue-200" : "ring-zinc-200",
                  )}
                >
                  <SourceMarker source={source} channel={email.channel} size="sm" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      isFyi
                        ? "font-medium text-zinc-500"
                        : needsRyan
                          ? "font-semibold text-zinc-900"
                          : "font-medium text-zinc-800",
                    )}
                  >
                    {email.from_name ?? email.from_address}
                  </span>
                  {isInternal && email.from_role && (
                    <span
                      className={cn(
                        "shrink-0 truncate text-xs",
                        isFyi ? "text-zinc-400" : "text-zinc-500",
                      )}
                      title={email.from_role}
                    >
                      · {email.from_role}
                    </span>
                  )}
                  {needsRyan && (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500"
                      aria-label="Needs Ryan"
                    />
                  )}
                  <span
                    className="ml-auto shrink-0 text-xs text-zinc-400"
                    suppressHydrationWarning
                  >
                    {mounted ? formatRelativeTime(email.received_at) : ""}
                  </span>
                </div>

                <div
                  className={cn(
                    "mt-0.5 truncate text-sm",
                    isFyi
                      ? "text-zinc-400"
                      : needsRyan
                        ? "text-zinc-700"
                        : "text-zinc-500",
                  )}
                >
                  {cleanedSubject}
                </div>

                <div className="mt-1.5 flex items-center gap-2">
                  <CategoryBadge category={email.category} />
                  {email.channel === "slack" && tag && (
                    <span className="font-mono text-[11px] text-zinc-400">
                      #{tag.replace(/^#/, "")}
                    </span>
                  )}
                  <span className="ml-auto">
                    {isInternalCategory(email.category) && email.category === "internal_fyi" ? (
                      <span className="font-mono text-xs text-zinc-300 tabular-nums">
                        {email.priority_score}
                      </span>
                    ) : (
                      <PriorityPill score={email.priority_score} />
                    )}
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="max-w-xs">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
          ✓
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-800">
          Nothing needs you right now.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Clear the filters to see the rest of the queue.
        </p>
      </div>
    </div>
  );
}
