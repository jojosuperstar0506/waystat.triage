"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { CATEGORY_LABEL, CATEGORY_TINT } from "@/lib/format";
import {
  EXTERNAL_CATEGORIES,
  INTERNAL_CATEGORIES,
  type EmailCategory,
  type ItemSource,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  total: number;
  shown: number;
  needsRyanCount: number;
  activeCategories: Set<EmailCategory>;
  onToggleCategory: (c: EmailCategory) => void;
  sourceFilter: "all" | ItemSource;
  onSourceFilterChange: (f: "all" | ItemSource) => void;
  needsRyanOnly: boolean;
  onToggleNeedsRyan: () => void;
  onClear: () => void;
}

export function FilterBar({
  total,
  shown,
  needsRyanCount,
  activeCategories,
  onToggleCategory,
  sourceFilter,
  onSourceFilterChange,
  needsRyanOnly,
  onToggleNeedsRyan,
  onClear,
}: FilterBarProps) {
  // Internal category chips collapse behind a toggle by default — 14
  // chips at once is a wall of buttons. External stays visible because
  // those are the original / more frequent categories.
  const [showInternalChips, setShowInternalChips] = useState(false);

  const anyActive =
    activeCategories.size > 0 || needsRyanOnly || sourceFilter !== "all";

  return (
    <div className="space-y-2 border-b border-zinc-200 bg-white px-4 py-3">
      {/* Row 1: source segmented control + needs-ryan toggle + counts */}
      <div className="flex flex-wrap items-center gap-2">
        <SourceSegmented value={sourceFilter} onChange={onSourceFilterChange} />

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
          Needs you
          <span className="ml-0.5 rounded bg-white/60 px-1 text-[10px] tabular-nums">
            {needsRyanCount}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {anyActive && (
            <button
              onClick={onClear}
              className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Clear
            </button>
          )}
          <span className="text-xs text-zinc-500 tabular-nums">
            {shown === total ? `${total} items` : `${shown} of ${total}`}
          </span>
        </div>
      </div>

      {/* Row 2: external chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {EXTERNAL_CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            category={c}
            active={activeCategories.has(c)}
            onClick={() => onToggleCategory(c)}
          />
        ))}

        <button
          onClick={() => setShowInternalChips((v) => !v)}
          className={cn(
            "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
            showInternalChips
              ? "bg-blue-50 text-blue-700 ring-blue-200"
              : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
          )}
        >
          Internal
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showInternalChips && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Row 3: internal chips (collapsed by default) */}
      {showInternalChips && (
        <div className="flex flex-wrap items-center gap-1.5">
          {INTERNAL_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              category={c}
              active={activeCategories.has(c)}
              onClick={() => onToggleCategory(c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  category,
  active,
  onClick,
}: {
  category: EmailCategory;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
        active
          ? CATEGORY_TINT[category]
          : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
      )}
    >
      {CATEGORY_LABEL[category]}
    </button>
  );
}

function SourceSegmented({
  value,
  onChange,
}: {
  value: "all" | ItemSource;
  onChange: (v: "all" | ItemSource) => void;
}) {
  const options: { label: string; value: "all" | ItemSource }[] = [
    { label: "All", value: "all" },
    { label: "External", value: "external" },
    { label: "Internal", value: "internal" },
  ];
  return (
    <div className="inline-flex rounded-md bg-zinc-100 p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-2.5 py-1 font-medium transition-colors",
            value === opt.value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
