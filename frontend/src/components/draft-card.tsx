"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DraftCard({ body }: { body: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!body) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-4 text-sm text-zinc-500 italic">
        No draft generated for this email. (Pure noise, edge cases, and some
        sensitive replies are left for a human to write from scratch.)
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Suggested draft
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(body);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* no-op */
            }
          }}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-zinc-800">
        {body}
      </pre>
    </div>
  );
}
