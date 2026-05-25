import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, CATEGORY_TINT } from "@/lib/format";
import type { EmailCategory } from "@/lib/types";

export function CategoryBadge({ category }: { category: EmailCategory | null }) {
  if (!category) {
    return <Badge className="bg-zinc-50 text-zinc-400 ring-zinc-200">unclassified</Badge>;
  }
  return <Badge className={CATEGORY_TINT[category]}>{CATEGORY_LABEL[category]}</Badge>;
}
