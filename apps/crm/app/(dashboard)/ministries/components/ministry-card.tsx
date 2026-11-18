import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MinistrySummary } from "../types";
import { formatMoney, getExecutionPercent, getLeaderInitials } from "../utils/ministry-stats";

interface MinistryCardProps {
  ministry: MinistrySummary;
}

export function MinistryCard({ ministry }: MinistryCardProps) {
  const percent = getExecutionPercent(ministry);

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-medium leading-tight">{ministry.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{ministry.volunteers} voluntarios</p>
        </div>
        <Badge className="bg-accent text-accent-foreground" variant="secondary">
          {ministry.category}
        </Badge>
      </header>

      <p className="text-sm leading-6 text-tinta-suave">{ministry.description}</p>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-medium text-primary-foreground"
        >
          {getLeaderInitials(ministry.leaderName)}
        </span>
        <div className="leading-tight">
          <p className="text-[11px] text-muted-foreground">Líder</p>
          <p className="text-sm font-semibold">{ministry.leaderName}</p>
        </div>
        {ministry.visibleOnSite ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-income">
            <Eye aria-hidden="true" className="size-3.5" />
            Visible en el sitio
          </span>
        ) : null}
      </div>

      <div className="mt-auto">
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
          <span className="font-semibold tabular-nums">
            {formatMoney(ministry.currency, ministry.executed)}
          </span>
          <span className="text-muted-foreground">
            de {formatMoney(ministry.currency, ministry.budget)} · {percent} %
          </span>
        </div>
        <Progress aria-label={`Presupuesto ejecutado de ${ministry.name}`} value={percent} />
      </div>
    </article>
  );
}
