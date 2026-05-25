"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Hash, Mail, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Channel, ItemSource } from "@/lib/types";

export interface DraftState {
  // Current (possibly edited) body. `null` means "use the AI original".
  editedBody: string | null;
  sent: boolean;
  sentAt: string | null;
}

export const EMPTY_DRAFT_STATE: DraftState = {
  editedBody: null,
  sent: false,
  sentAt: null,
};

interface DraftCardProps {
  emailId: string;
  body: string | null;
  state: DraftState;
  onChange: (next: DraftState) => void;
  source: ItemSource;
  channel?: Channel | null;
  recipientName?: string | null;
}

// Send button label varies by channel — sending a Slack DM and sending an
// external customer reply are operationally different actions, even if the
// underlying mock just flips a flag.
function sendLabel(source: ItemSource, channel?: Channel | null): string {
  if (source === "internal" && channel === "slack") return "Send Slack reply";
  if (source === "internal") return "Send";
  return "Send reply";
}

function SendIcon({ source, channel }: { source: ItemSource; channel?: Channel | null }) {
  if (source === "internal" && channel === "slack") return <Hash className="h-3.5 w-3.5" />;
  if (source === "internal") return <Mail className="h-3.5 w-3.5" />;
  return <Send className="h-3.5 w-3.5" />;
}

export function DraftCard({
  body,
  state,
  onChange,
  source,
  channel,
  recipientName,
}: DraftCardProps) {
  if (!body) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-4 text-sm text-zinc-500 italic">
        No draft for this item. Suggested action is to auto-archive or handle
        outside of a written reply.
      </div>
    );
  }

  const currentBody = state.editedBody ?? body;
  const isEdited = state.editedBody != null && state.editedBody !== body;

  if (state.sent) {
    return <SentReceipt state={state} recipientName={recipientName} onUndo={() =>
      onChange({ ...state, sent: false, sentAt: null })
    } />;
  }

  return (
    <Editor
      original={body}
      currentBody={currentBody}
      isEdited={isEdited}
      source={source}
      channel={channel}
      onBodyChange={(next) =>
        onChange({ ...state, editedBody: next === body ? null : next })
      }
      onRevert={() => onChange({ ...state, editedBody: null })}
      onSend={() =>
        onChange({
          ...state,
          sent: true,
          sentAt: new Date().toISOString(),
        })
      }
    />
  );
}

function Editor({
  original,
  currentBody,
  isEdited,
  source,
  channel,
  onBodyChange,
  onRevert,
  onSend,
}: {
  original: string;
  currentBody: string;
  isEdited: boolean;
  source: ItemSource;
  channel?: Channel | null;
  onBodyChange: (v: string) => void;
  onRevert: () => void;
  onSend: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea to fit content so Ryan can see the whole draft
  // without scrolling a tiny box. Capped at a generous max so a runaway
  // draft can't push the rest of the page down forever.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 600)}px`;
  }, [currentBody]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Suggested draft
          </span>
          {isEdited && (
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
              Edited
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isEdited && (
            <Button variant="ghost" size="sm" onClick={onRevert} title="Restore AI draft">
              <Undo2 className="h-3 w-3" /> Revert
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={copy}>
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
      </div>

      <textarea
        ref={textareaRef}
        value={currentBody}
        onChange={(e) => onBodyChange(e.target.value)}
        spellCheck
        className="block w-full resize-none border-0 bg-white px-4 py-4 font-sans text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
        // Help inputs render the original cleanly; the auto-resize effect
        // adjusts after mount.
        rows={Math.max(4, currentBody.split("\n").length)}
      />

      <div className="flex items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50/60 px-4 py-2">
        <span className="text-xs text-zinc-500">
          {isEdited
            ? "You've edited this draft. Send when ready."
            : "Edit inline, or send as-is."}
        </span>
        <Button onClick={onSend} size="sm">
          <SendIcon source={source} channel={channel} />
          {sendLabel(source, channel)}
        </Button>
      </div>
    </div>
  );
}

function SentReceipt({
  state,
  recipientName,
  onUndo,
}: {
  state: DraftState;
  recipientName?: string | null;
  onUndo: () => void;
}) {
  // Format sent timestamp on the client only — Date#toLocaleTimeString
  // formatting differs SSR vs hydration.
  const [timeLabel, setTimeLabel] = useState("");
  useEffect(() => {
    if (!state.sentAt) return;
    setTimeLabel(
      new Date(state.sentAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, [state.sentAt]);

  return (
    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
          <Check className="h-3 w-3" />
        </span>
        <span className="font-medium text-emerald-900">
          Sent{recipientName ? ` to ${recipientName}` : ""}
          {timeLabel && <span className="font-normal text-emerald-700"> · {timeLabel}</span>}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onUndo}>
        <Undo2 className="h-3 w-3" /> Undo
      </Button>
    </div>
  );
}
