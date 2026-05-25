"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPTY_DRAFT_STATE, type DraftState } from "@/components/draft-card";
import { EmailDetail } from "@/components/email-detail";
import { FilterBar } from "@/components/filter-bar";
import { InboxList } from "@/components/inbox-list";
import { QueueSummaryStrip } from "@/components/queue-summary";
import { sortInbox, sourceOf, summarizeQueue } from "@/lib/triage-utils";
import type {
  EmailCategory,
  FeedbackPayload,
  ItemSource,
  TriagedEmail,
} from "@/lib/types";

interface TriageDashboardProps {
  initialEmails: TriagedEmail[];
  source: "api" | "mock";
  submitFeedbackAction: (
    emailId: string,
    payload: FeedbackPayload,
  ) => Promise<{ ok: boolean; error?: string }>;
  refreshAction: () => Promise<TriagedEmail[]>;
}

export function TriageDashboard({
  initialEmails,
  source,
  submitFeedbackAction,
  refreshAction,
}: TriageDashboardProps) {
  const sorted = useMemo(() => sortInbox(initialEmails), [initialEmails]);
  const [emails, setEmails] = useState<TriagedEmail[]>(sorted);
  // Default selection: first item that needs Ryan, else first in list.
  const initialSelected =
    sorted.find((e) => e.needs_ryan)?.email_id ?? sorted[0]?.email_id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);
  const [activeCategories, setActiveCategories] = useState<Set<EmailCategory>>(
    new Set(),
  );
  const [needsRyanOnly, setNeedsRyanOnly] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"all" | ItemSource>("all");
  const [refreshing, startRefresh] = useTransition();
  // Per-email draft state (edits + sent flag), keyed by email_id. Lives in
  // the dashboard so edits and "sent" receipts persist when the user
  // navigates away and back to an item. No backend persistence yet —
  // intentional for the demo.
  const [draftStates, setDraftStates] = useState<Record<string, DraftState>>({});

  const updateDraftState = useCallback((emailId: string, next: DraftState) => {
    setDraftStates((prev) => ({ ...prev, [emailId]: next }));
  }, []);

  const filtered = useMemo(() => {
    return emails.filter((e) => {
      if (needsRyanOnly && !e.needs_ryan) return false;
      if (sourceFilter !== "all" && sourceOf(e) !== sourceFilter) return false;
      if (activeCategories.size > 0) {
        if (!e.category || !activeCategories.has(e.category)) return false;
      }
      return true;
    });
  }, [emails, activeCategories, needsRyanOnly, sourceFilter]);

  const selected = useMemo(
    () => emails.find((e) => e.email_id === selectedId) ?? null,
    [emails, selectedId],
  );

  // Summary always reflects the full queue, not the filtered slice — the
  // point is to surface the time-allocation picture, not to count what's
  // currently visible.
  const summary = useMemo(() => summarizeQueue(emails), [emails]);
  const needsRyanCount = summary.needsRyan;

  function toggleCategory(c: EmailCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function clearFilters() {
    setActiveCategories(new Set());
    setNeedsRyanOnly(false);
    setSourceFilter("all");
  }

  function refresh() {
    startRefresh(async () => {
      const next = sortInbox(await refreshAction());
      setEmails(next);
      if (selectedId && !next.find((e) => e.email_id === selectedId)) {
        setSelectedId(next.find((e) => e.needs_ryan)?.email_id ?? next[0]?.email_id ?? null);
      }
    });
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold text-zinc-900">Waystation Triage</h1>
          <span className="text-xs text-zinc-500">
            Cross-source queue — external email + internal items
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SourcePill source={source} />
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw
              className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"}
            />
            Refresh
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[26rem_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-white">
          <QueueSummaryStrip summary={summary} />
          <FilterBar
            total={emails.length}
            shown={filtered.length}
            needsRyanCount={needsRyanCount}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            needsRyanOnly={needsRyanOnly}
            onToggleNeedsRyan={() => setNeedsRyanOnly((v) => !v)}
            onClear={clearFilters}
          />
          <div className="flex-1 overflow-y-auto">
            <InboxList
              emails={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </aside>

        <main className="min-h-0">
          <EmailDetail
            email={selected}
            allEmails={emails}
            onSelect={setSelectedId}
            draftState={
              selected ? draftStates[selected.email_id] ?? EMPTY_DRAFT_STATE : EMPTY_DRAFT_STATE
            }
            onDraftChange={(next) => {
              if (selected) updateDraftState(selected.email_id, next);
            }}
            onSubmitFeedback={submitFeedbackAction}
          />
        </main>
      </div>
    </div>
  );
}

function SourcePill({ source }: { source: "api" | "mock" }) {
  if (source === "api") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live API
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200"
      title="NEXT_PUBLIC_API_URL is not set. Showing bundled sample data."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo data
    </span>
  );
}
