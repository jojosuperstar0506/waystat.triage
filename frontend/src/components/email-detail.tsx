"use client";

import { Star } from "lucide-react";
import { ActionBadge } from "@/components/action-badge";
import { CategoryBadge } from "@/components/category-badge";
import { ChannelChip } from "@/components/channel-chip";
import { CrossLinkPanel } from "@/components/cross-link-panel";
import { DraftCard, type DraftState } from "@/components/draft-card";
import { ExtractedFields } from "@/components/extracted-fields";
import { FeedbackPanel } from "@/components/feedback-panel";
import { PriorityPill } from "@/components/priority-pill";
import { SourceMarker } from "@/components/source-marker";
import { senderInitials } from "@/lib/format";
import { sourceOf, splitSubjectPrefix } from "@/lib/triage-utils";
import type { FeedbackPayload, TriagedEmail } from "@/lib/types";

interface EmailDetailProps {
  email: TriagedEmail | null;
  allEmails: TriagedEmail[];
  onSelect: (emailId: string) => void;
  draftState: DraftState;
  onDraftChange: (next: DraftState) => void;
  onSubmitFeedback: (
    emailId: string,
    payload: FeedbackPayload,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function EmailDetail({
  email,
  allEmails,
  onSelect,
  draftState,
  onDraftChange,
  onSubmitFeedback,
}: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-zinc-500">
        Select an item to see its triage record.
      </div>
    );
  }

  const source = sourceOf(email);
  const isInternal = source === "internal";
  const isSlack = email.channel === "slack";
  const { tag: channelPrefix, subject: cleanSubject } = splitSubjectPrefix(email.subject);

  const received = new Date(email.received_at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-start gap-3">
          <div
            className={
              isInternal
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700"
            }
          >
            {senderInitials(email.from_name, email.from_address)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-semibold text-zinc-900">
                {email.from_name ?? email.from_address}
              </span>
              {/* Per docs/open_questions.md #1: suppress the <email@x> line for
                  Slack items (the from_address is a display name, not an addr).
                  Show the from_role chip instead. */}
              {isSlack ? (
                email.from_role && (
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
                    {email.from_role}
                  </span>
                )
              ) : (
                <>
                  <span className="truncate text-zinc-500">
                    &lt;{email.from_address}&gt;
                  </span>
                  {isInternal && email.from_role && (
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
                      {email.from_role}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
              <SourceMarker source={source} channel={email.channel} size="sm" />
              <span>{received}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {email.needs_ryan && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                <Star className="h-3 w-3 fill-rose-500 text-rose-500" /> Needs you
              </span>
            )}
            <PriorityPill score={email.priority_score} />
          </div>
        </div>

        <h2 className="mt-3 text-base font-semibold text-zinc-900">
          {cleanSubject}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CategoryBadge category={email.category} />
          <ActionBadge action={email.suggested_action} />
          {isInternal && (
            <ChannelChip
              channel={email.channel ?? null}
              prefix={channelPrefix}
            />
          )}
          {email.classification_confidence != null && (
            <span className="text-xs text-zinc-500">
              conf {email.classification_confidence.toFixed(2)}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-zinc-50/50">
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
          {/* Cross-link panel — surfaces when this item is connected to
              another in the queue (same customer, same project, etc.).
              Renders nothing if no links. */}
          <CrossLinkPanel
            email={email}
            allEmails={allEmails}
            onSelect={onSelect}
          />

          <Section title={isInternal ? "Original message" : "Original email"}>
            <pre className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white px-4 py-4 font-sans text-sm leading-relaxed text-zinc-800">
              {email.body ?? "(empty body)"}
            </pre>
          </Section>

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

          <Section title="Extracted fields">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <ExtractedFields fields={email.extracted_fields} />
            </div>
          </Section>

          <Section
            title="Suggested action"
            right={<ActionBadge action={email.suggested_action} />}
          >
            {email.action_reasoning && (
              <p className="mb-3 text-sm text-zinc-600">{email.action_reasoning}</p>
            )}
            <DraftCard
              emailId={email.email_id}
              body={email.draft_body}
              state={draftState}
              onChange={onDraftChange}
              source={source}
              channel={email.channel}
              recipientName={email.from_name}
            />
          </Section>

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
