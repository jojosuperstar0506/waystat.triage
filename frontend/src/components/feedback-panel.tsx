"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackPayload, TriagedEmail } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  email: TriagedEmail;
  onSubmit: (payload: FeedbackPayload) => Promise<{ ok: boolean; error?: string }>;
}

export function FeedbackPanel({ email, onSubmit }: FeedbackPanelProps) {
  const [classificationCorrect, setClassificationCorrect] = useState<boolean | null>(
    email.classification_correct,
  );
  const [priorityCorrect, setPriorityCorrect] = useState<boolean | null>(
    email.priority_correct,
  );
  const [responseQuality, setResponseQuality] = useState<number | null>(
    email.response_quality,
  );
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (classificationCorrect == null) return;
    const payload: FeedbackPayload = {
      classification_correct: classificationCorrect,
      priority_correct: priorityCorrect,
      response_quality: responseQuality,
      notes: notes.trim() || null,
      reviewed_by: "ryan",
    };
    startTransition(async () => {
      const result = await onSubmit(payload);
      setStatus(result.ok ? "saved" : "error");
      if (result.ok) {
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Triage feedback</h3>
      <p className="mt-0.5 text-xs text-zinc-500">
        Builds the ground-truth eval set. Skip if everything looks right.
      </p>

      <div className="mt-4 space-y-4">
        <YesNoRow
          label="Classification correct?"
          value={classificationCorrect}
          onChange={setClassificationCorrect}
        />
        <YesNoRow
          label="Priority correct?"
          value={priorityCorrect}
          onChange={setPriorityCorrect}
        />
        <div>
          <div className="text-xs font-medium text-zinc-700">Response quality</div>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setResponseQuality(n === responseQuality ? null : n)}
                className={cn(
                  "h-7 w-7 rounded-md text-xs font-mono ring-1 ring-inset transition-colors",
                  responseQuality === n
                    ? "bg-zinc-900 text-white ring-zinc-900"
                    : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            htmlFor="feedback-notes"
            className="text-xs font-medium text-zinc-700"
          >
            Notes (optional)
          </label>
          <textarea
            id="feedback-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="What did the model miss?"
            className="mt-1.5 block w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={submit}
          disabled={classificationCorrect == null || pending}
          size="sm"
        >
          {pending ? "Saving…" : "Save feedback"}
        </Button>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-rose-600">Failed to save — try again.</span>
        )}
      </div>
    </div>
  );
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(value === true ? null : true)}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium ring-1 ring-inset transition-colors",
            value === true
              ? "bg-emerald-100 text-emerald-800 ring-emerald-300"
              : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
          )}
        >
          <Check className="h-3 w-3" /> Yes
        </button>
        <button
          onClick={() => onChange(value === false ? null : false)}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium ring-1 ring-inset transition-colors",
            value === false
              ? "bg-rose-100 text-rose-800 ring-rose-300"
              : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50",
          )}
        >
          <X className="h-3 w-3" /> No
        </button>
      </div>
    </div>
  );
}
