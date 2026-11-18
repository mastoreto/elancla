import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { formatMoneyCompact } from "@/lib/format-money";
import type { BudgetSummary } from "../utils";

interface BudgetsSummaryProps {
  summary: BudgetSummary;
}

function describeAlerts({ overCount, nearCount }: BudgetSummary): string {
  const parts = [
    overCount > 0 ? `${overCount} excedido${overCount === 1 ? "" : "s"}` : null,
    nearCount > 0 ? `${nearCount} al 90 %` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Todo en orden";
}

export function BudgetsSummary({ summary }: BudgetsSummaryProps) {
  return (
    <StatCardGrid>
      <StatCard
        detail={`${summary.count} presupuesto${summary.count === 1 ? "" : "s"} activo${summary.count === 1 ? "" : "s"}`}
        label="Presupuesto total"
        value={formatMoneyCompact(summary.total, "UYU", "million")}
      />
      <StatCard
        detail={`${summary.usedPercent} % del total`}
        label="Usado"
        value={formatMoneyCompact(summary.used, "UYU", "million")}
      />
      <StatCard
        detail={`${summary.availablePercent} % restante`}
        label="Disponible"
        value={formatMoneyCompact(summary.available, "UYU", "million")}
      />
      <StatCard
        detail={describeAlerts(summary)}
        highlighted={true}
        label="En alerta"
        value={String(summary.overCount + summary.nearCount)}
      />
    </StatCardGrid>
  );
}
