import { Badge } from "@/components/ui/badge";
import { ACTION_LABEL, ACTION_TINT } from "@/lib/format";
import type { SuggestedAction } from "@/lib/types";

export function ActionBadge({ action }: { action: SuggestedAction | null }) {
  if (!action) return null;
  return <Badge className={ACTION_TINT[action]}>{ACTION_LABEL[action]}</Badge>;
}
