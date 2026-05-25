"use client";

import { Star } from "lucide-react";
import { ActionBadge } from "@/components/action-badge";
import { CategoryBadge } from "@/components/category-badge";
import { DraftCard } from "@/components/draft-card";
import { ExtractedFields } from "@/components/extracted-fields";
import { FeedbackPanel } from "@/components/feedback-panel";
import { PriorityPill } from "@/components/priority-pill";
import { senderInitials } from "@/lib/format";
import type { FeedbackPayload, TriagedEmail } from "@/lib/types";

interface EmailDetailProps {
  email: TriagedEmail | null;
  onSubmitFeedback: (
    emailId: string,
    payload: FeedbackPayload,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function EmailDetail({ email, onSubmitFeedback }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
        Select an email to see its triage record.
      </div>
    );
  }

  const received = new Date(email.received_at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
            {senderInitials(email.from_name, email.from_address)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-zinc-900">
                {email.from_name ?? email.from_address}
              </span>
              {email.from_name && (
                <span className="text-zinc-500">&lt;{email.from_address}&gt;</span>
              )}
            </div>
            <div className="text-xs text-zinc-500">{received}</div>
          </div>
          <div className="flex items-center gap-2">
            {email.needs_ryan && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                <Star className="h-3 w-3 fill-rose-500 text-rose-500" /> Needs Ryan
              </span>
            )}
            <PriorityPill score={email.priority_score} />
          </div>
        </div>
        <h2 className="mt-3 text-base font-semibold text-zinc-900">
          {email.subject ?? "(no subject)"}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CategoryBadge category={email.category} />
          <ActionBadge action={email.suggested_action} />
          {email.classification_confidence != null && (
            <span className="text-xs text-zinc-500">
              conf {email.classification_confidence.toFixed(2)}
            </span>
          )}
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/50">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
          {/* Original email body */}
          <Section title="Original email">
            <pre className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white px-4 py-4 font-sans text-sm leading-relaxed text-zinc-800">
              {email.body ?? "(empty body)"}
            </pre>
          </Section>

          {/* Pipeline reasoning */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReasoningCard
              title="Why this category"
              body={email.classification_reasoning}
            />
            <ReasoningCard
              title="Why this priority"
              body={email.priority_reasoning}
            />
          </div>

          {/* Extracted fields */}
          <Section title="Extracted fields">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <ExtractedFields fields={email.extracted_fields} />
            </div>
          </Section>

          {/* Suggested action + draft */}
          <Section
            title="Suggested action"
            right={<ActionBadge action={email.suggested_action} />}
          >
            {email.action_reasoning && (
              <p className="mb-3 text-sm text-zinc-600">{email.action_reasoning}</p>
            )}
            <DraftCard body={email.draft_body} />
          </Section>

          {/* Feedback */}
          <FeedbackPanel
            email={email}
            onSubmit={(payload) => onSubmitFeedback(email.email_id, payload)}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {title}
        </h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function ReasoningCard({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">
        {body ?? <span className="italic text-zinc-400">No reasoning recorded.</span>}
      </p>
    </div>
  );
}
