"use client";

import { Star } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_TINT } from "@/lib/format";
import type { EmailCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  total: number;
  shown: number;
  needsRyanCount: number;
  activeCategories: Set<EmailCategory>;
  onToggleCategory: (c: EmailCategory) => void;
  needsRyanOnly: boolean;
  onToggleNeedsRyan: () => void;
  onClear: () => void;
}

const CATEGORIES: EmailCategory[] = [
  "sales_inquiry",
  "renewal_expansion",
  "customer_support",
  "recruiting",
  "vendor_pitch",
  "edge_case",
  "noise",
];

export function FilterBar({
  total,
  shown,
  needsRyanCount,
  activeCategories,
  onToggleCategory,
  needsRyanOnly,
  onToggleNeedsRyan,
  onClear,
}: FilterBarProps) {
  const anyActive = activeCategories.size > 0 || needsRyanOnly;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
      <button
        onClick={onToggleNeedsRyan}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
          needsRyanOnly
            ? "bg-rose-100 text-rose-800 ring-rose-300"
            : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
        )}
      >
        <Star
          className={cn(
            "h-3.5 w-3.5",
            needsRyanOnly ? "fill-rose-500 text-rose-500" : "text-zinc-400",
          )}
        />
        Needs Ryan
        <span className="ml-0.5 rounded bg-white/60 px-1 text-[10px] tabular-nums">
          {needsRyanCount}
        </span>
      </button>

      <span className="mx-1 h-4 w-px bg-zinc-200" aria-hidden />

      {CATEGORIES.map((c) => {
        const active = activeCategories.has(c);
        return (
          <button
            key={c}
            onClick={() => onToggleCategory(c)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
              active
                ? CATEGORY_TINT[c]
                : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
            )}
          >
            {CATEGORY_LABEL[c]}
          </button>
        );
      })}

      {anyActive && (
        <button
          onClick={onClear}
          className="ml-1 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          Clear
        </button>
      )}

      <div className="ml-auto text-xs text-zinc-500 tabular-nums">
        {shown === total ? `${total} emails` : `${shown} of ${total}`}
      </div>
    </div>
  );
}
