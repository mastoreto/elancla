import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VotingStatus } from "../types";
import { votingStatusLabels } from "../voting-config";

const styles = {
  badge: cn("rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase"),
};

const statusClassNames: Record<VotingStatus, string> = {
  draft: cn("border-slate-300 bg-slate-100 text-slate-700"),
  open: cn("border-emerald-200 bg-emerald-100 text-emerald-700"),
  closed: cn("border-zinc-300 bg-zinc-100 text-zinc-700"),
};

export function VotingStatusBadge({ status }: { status: VotingStatus }) {
  return (
    <Badge variant="outline" className={cn(styles.badge, statusClassNames[status])}>
      {votingStatusLabels[status]}
    </Badge>
  );
}
