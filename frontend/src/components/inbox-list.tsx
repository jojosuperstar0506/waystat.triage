"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { PriorityPill } from "@/components/priority-pill";
import { formatRelativeTime, senderInitials } from "@/lib/format";
import type { TriagedEmail } from "@/lib/types";
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
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
        No emails match the current filters.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-zinc-100">
      {emails.map((email) => {
        const selected = email.email_id === selectedId;
        const needsRyan = email.needs_ryan === true;
        return (
          <li key={email.email_id}>
            <button
              onClick={() => onSelect(email.email_id)}
              className={cn(
                "group flex w-full gap-3 px-4 py-3 text-left transition-colors",
                selected ? "bg-zinc-100" : "hover:bg-zinc-50",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  needsRyan
                    ? "bg-rose-100 text-rose-700"
                    : "bg-zinc-100 text-zinc-600",
                )}
              >
                {senderInitials(email.from_name, email.from_address)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      needsRyan ? "font-semibold text-zinc-900" : "font-medium text-zinc-800",
                    )}
                  >
                    {email.from_name ?? email.from_address}
                  </span>
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
                    needsRyan ? "text-zinc-700" : "text-zinc-500",
                  )}
                >
                  {email.subject ?? "(no subject)"}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <CategoryBadge category={email.category} />
                  <span className="ml-auto">
                    <PriorityPill score={email.priority_score} />
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
