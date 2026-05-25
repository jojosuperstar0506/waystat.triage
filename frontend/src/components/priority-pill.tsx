import { cn } from "@/lib/utils";

export function PriorityPill({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="text-xs font-mono text-zinc-400">—</span>
    );
  }
  const tone =
    score >= 80
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : score >= 50
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-zinc-50 text-zinc-500 ring-zinc-200";
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[2rem] items-center justify-center rounded-md px-1.5 font-mono text-xs font-semibold ring-1 ring-inset tabular-nums",
        tone,
      )}
      title={`Priority score: ${score}/100`}
    >
      {score}
    </span>
  );
}
