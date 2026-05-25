import { Hash, MessageSquare, Mail } from "lucide-react";
import type { Channel, ItemSource } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SourceMarkerProps {
  source: ItemSource;
  channel?: Channel | null;
  size?: "sm" | "md";
}

// Tiny icon used inside the avatar slot in the list, and inline in the
// detail header. External = inbox/mail glyph. Internal = Slack (#) or
// internal email (envelope), so the channel reads at a glance.
export function SourceMarker({ source, channel, size = "md" }: SourceMarkerProps) {
  const klass = cn(
    "shrink-0",
    size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
  );

  if (source === "internal") {
    if (channel === "slack") return <Hash className={klass} aria-label="Slack" />;
    return <MessageSquare className={klass} aria-label="Internal email" />;
  }
  return <Mail className={klass} aria-label="External email" />;
}
