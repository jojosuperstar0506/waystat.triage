import { Star, Clock, Inbox } from "lucide-react";
import { formatMinutes, type QueueSummary } from "@/lib/triage-utils";

// Compact strip at the top of the inbox column. Reads in two seconds:
// total items · needs you · ext/int split · estimated time.
//
// "Estimated time" is a heuristic sum over suggested-action minutes
// (see lib/format.ts:ACTION_MINUTES) — the right read is "is this a
// half hour or two hours of CEO time today", not "I have 47 minutes
// of work." A short tooltip on the chip explains that.
export function QueueSummaryStrip({ summary }: { summary: QueueSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-zinc-200 bg-zinc-50/70 px-4 py-2.5 text-xs">
      <Stat icon={<Inbox className="h-3.5 w-3.5 text-zinc-500" />}>
        <span className="font-semibold text-zinc-900 tabular-nums">{summary.total}</span>{" "}
        <span className="text-zinc-500">in queue</span>
      </Stat>

      <Sep />

      <Stat icon={<Star className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />}>
        <span className="font-semibold text-rose-700 tabular-nums">
          {summary.needsRyan}
        </span>{" "}
        <span className="text-zinc-500">need you</span>
      </Stat>

      <Sep />

      <span className="text-zinc-600 tabular-nums">
        <span className="font-medium text-emerald-700">{summary.needsRyanExternal} ext</span>
        <span className="mx-1 text-zinc-300">/</span>
        <span className="font-medium text-blue-700">{summary.needsRyanInternal} int</span>
      </span>

      <Sep />

      <Stat
        icon={<Clock className="h-3.5 w-3.5 text-zinc-500" />}
        title={`Heuristic estimate based on the suggested action for each "needs you" item. Treat as a rough order-of-magnitude, not a budget.`}
      >
        <span className="font-medium text-zinc-700">
          Est. {formatMinutes(summary.estimatedMinutes)}
        </span>
      </Stat>
    </div>
  );
}

function Stat({
  icon,
  children,
  title,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={title}>
      {icon}
      {children}
    </span>
  );
}

function Sep() {
  return <span className="text-zinc-300" aria-hidden>·</span>;
}
