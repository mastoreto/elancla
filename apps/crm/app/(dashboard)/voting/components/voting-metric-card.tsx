import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const votingMetricCardVotingPage = {
  card: cn("border-border/70 bg-card/80 shadow-sm"),
  content: cn("flex items-start justify-between gap-4 p-5"),
  label: cn("text-sm font-medium text-muted-foreground"),
  value: cn("mt-2 text-3xl font-semibold tracking-tight text-foreground"),
  hint: cn("mt-2 text-sm text-muted-foreground"),
  iconWrap: cn("flex size-11 items-center justify-center rounded-2xl bg-muted"),
  icon: cn("size-5 text-foreground"),
};

export function VotingMetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className={votingMetricCardVotingPage.card}>
      <CardContent className={votingMetricCardVotingPage.content}>
        <div>
          <p className={votingMetricCardVotingPage.label}>{label}</p>
          <p className={votingMetricCardVotingPage.value}>{value}</p>
          <p className={votingMetricCardVotingPage.hint}>{hint}</p>
        </div>

        <div className={votingMetricCardVotingPage.iconWrap}>
          <Icon className={votingMetricCardVotingPage.icon} />
        </div>
      </CardContent>
    </Card>
  );
}
