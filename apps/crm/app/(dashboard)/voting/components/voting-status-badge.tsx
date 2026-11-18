import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VotingStatus } from "../types";
import { votingStatusLabels } from "../voting-config";

const styles = {
  badge: cn("rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase"),
};

const statusClassNames: Record<VotingStatus, string> = {
  draft: cn("border-border bg-secondary text-secondary-foreground"),
  open: cn("border-income bg-success-surface text-income"),
  closed: cn("border-border bg-secondary text-secondary-foreground"),
};

export function VotingStatusBadge({ status }: { status: VotingStatus }) {
  return (
    <Badge variant="outline" className={cn(styles.badge, statusClassNames[status])}>
      {votingStatusLabels[status]}
    </Badge>
  );
}
