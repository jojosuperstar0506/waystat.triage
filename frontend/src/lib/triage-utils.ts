import { ACTION_MINUTES } from "./format";
import type { ItemSource, TriagedEmail } from "./types";

// "External" is the default if the backend or fixture didn't tag a row.
export function sourceOf(email: TriagedEmail): ItemSource {
  return email.source ?? "external";
}

// Parse a channel-tag prefix off internal subjects, e.g.
//   "[#eng-decisions] Build vs buy" -> { tag: "#eng-decisions", subject: "Build vs buy" }
//   "[DM] feedback on the new cold email template?"
//        -> { tag: "DM", subject: "feedback on the new cold email template?" }
//   "Procurement automation"  -> { tag: null, subject: "Procurement automation" }
export function splitSubjectPrefix(subject: string | null): {
  tag: string | null;
  subject: string;
} {
  if (!subject) return { tag: null, subject: "(no subject)" };
  const match = subject.match(/^\s*\[([^\]]+)\]\s*(.*)$/);
  if (!match) return { tag: null, subject };
  return { tag: match[1]!.trim(), subject: match[2]!.trim() || "(no subject)" };
}

// Sort for the inbox list: needs_ryan=true pinned to top, then priority_score
// descending, then most-recent-first as the final tiebreaker. We do this on
// the client even though the SQL view also sorts by priority, because the
// needs_ryan pin is a UI policy (per docs/open_questions.md #3) — keeping it
// out of the view keeps the DB simple.
export function sortInbox(emails: TriagedEmail[]): TriagedEmail[] {
  return [...emails].sort((a, b) => {
    const aPin = a.needs_ryan ? 1 : 0;
    const bPin = b.needs_ryan ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    const aScore = a.priority_score ?? -1;
    const bScore = b.priority_score ?? -1;
    if (aScore !== bScore) return bScore - aScore;
    return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
  });
}

export interface QueueSummary {
  total: number;
  needsRyan: number;
  external: number;
  internal: number;
  needsRyanExternal: number;
  needsRyanInternal: number;
  estimatedMinutes: number;
}

// Summarize the queue for the top-of-list strip. The time estimate sums
// ACTION_MINUTES across items the user is likely to actually act on (i.e.
// not auto-archive), and only counts items flagged needs_ryan so the figure
// reflects "what's actually on your plate today" — not "all 45 emails".
export function summarizeQueue(emails: TriagedEmail[]): QueueSummary {
  let needsRyan = 0;
  let external = 0;
  let internal = 0;
  let needsRyanExternal = 0;
  let needsRyanInternal = 0;
  let estimatedMinutes = 0;

  for (const e of emails) {
    const src = sourceOf(e);
    if (src === "internal") internal++;
    else external++;

    if (e.needs_ryan) {
      needsRyan++;
      if (src === "internal") needsRyanInternal++;
      else needsRyanExternal++;
      if (e.suggested_action) {
        estimatedMinutes += ACTION_MINUTES[e.suggested_action];
      }
    }
  }

  return {
    total: emails.length,
    needsRyan,
    external,
    internal,
    needsRyanExternal,
    needsRyanInternal,
    estimatedMinutes,
  };
}

export function formatMinutes(mins: number): string {
  if (mins <= 0) return "~0 min";
  if (mins < 60) return `~${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `~${hours}h`;
  return `~${hours}h ${remainder}m`;
}
