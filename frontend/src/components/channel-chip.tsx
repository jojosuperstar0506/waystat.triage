import { Hash, Mail } from "lucide-react";
import { CHANNEL_LABEL } from "@/lib/format";
import type { Channel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChannelChipProps {
  channel: Channel | null | undefined;
  prefix?: string | null;  // e.g. "#eng-decisions" or "DM" parsed off the subject
  className?: string;
}

export function ChannelChip({ channel, prefix, className }: ChannelChipProps) {
  if (!channel) return null;
  const Icon = channel === "slack" ? Hash : Mail;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{CHANNEL_LABEL[channel]}</span>
      {prefix && (
        <>
          <span className="text-zinc-300">·</span>
          <span className="font-mono text-[11px] text-zinc-500">{prefix}</span>
        </>
      )}
    </span>
  );
}
