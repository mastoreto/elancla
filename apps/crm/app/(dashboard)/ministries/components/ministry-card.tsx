import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MinistrySummary } from "../types";
import { formatMoney, getExecutionPercent, getLeaderInitials } from "../utils/ministry-stats";

interface MinistryCardProps {
  ministry: MinistrySummary;
  className?: string;
}

export function MinistryCard({ ministry, className }: MinistryCardProps) {
  const percent = getExecutionPercent(ministry);
  const ministryCardMinistriesPage = {
    container: cn(
      "flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card",
      className,
    ),
    header: cn("flex flex-wrap items-start justify-between gap-2"),
    heading: cn("min-w-0"),
    name: cn("font-display text-lg font-medium leading-tight"),
    volunteers: cn("mt-1 text-xs text-muted-foreground"),
    category: cn("bg-accent text-accent-foreground"),
    description: cn("text-sm leading-6 text-tinta-suave"),
    leader: cn("flex items-center gap-3"),
    leaderAvatar: cn(
      "flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-medium text-primary-foreground",
    ),
    leaderText: cn("leading-tight"),
    leaderLabel: cn("text-[11px] text-muted-foreground"),
    leaderName: cn("text-sm font-semibold"),
    visibility: cn("ml-auto inline-flex items-center gap-1 text-xs text-income"),
    visibilityIcon: cn("size-3.5"),
    budget: cn("mt-auto"),
    budgetRow: cn("mb-1.5 flex items-baseline justify-between gap-2 text-xs"),
    executed: cn("font-semibold tabular-nums"),
    budgetTotal: cn("text-muted-foreground"),
  };

  return (
    <article className={ministryCardMinistriesPage.container}>
      <header className={ministryCardMinistriesPage.header}>
        <div className={ministryCardMinistriesPage.heading}>
          <h3 className={ministryCardMinistriesPage.name}>{ministry.name}</h3>
          <p className={ministryCardMinistriesPage.volunteers}>{ministry.volunteers} voluntarios</p>
        </div>
        <Badge className={ministryCardMinistriesPage.category} variant="secondary">
          {ministry.category}
        </Badge>
      </header>

      <p className={ministryCardMinistriesPage.description}>{ministry.description}</p>

      <div className={ministryCardMinistriesPage.leader}>
        <span aria-hidden="true" className={ministryCardMinistriesPage.leaderAvatar}>
          {getLeaderInitials(ministry.leaderName)}
        </span>
        <div className={ministryCardMinistriesPage.leaderText}>
          <p className={ministryCardMinistriesPage.leaderLabel}>Líder</p>
          <p className={ministryCardMinistriesPage.leaderName}>{ministry.leaderName}</p>
        </div>
        {ministry.visibleOnSite ? (
          <span className={ministryCardMinistriesPage.visibility}>
            <Eye aria-hidden="true" className={ministryCardMinistriesPage.visibilityIcon} />
            Visible en el sitio
          </span>
        ) : null}
      </div>

      <div className={ministryCardMinistriesPage.budget}>
        <div className={ministryCardMinistriesPage.budgetRow}>
          <span className={ministryCardMinistriesPage.executed}>
            {formatMoney(ministry.currency, ministry.executed)}
          </span>
          <span className={ministryCardMinistriesPage.budgetTotal}>
            de {formatMoney(ministry.currency, ministry.budget)} · {percent} %
          </span>
        </div>
        <Progress aria-label={`Presupuesto ejecutado de ${ministry.name}`} value={percent} />
      </div>
    </article>
  );
}
