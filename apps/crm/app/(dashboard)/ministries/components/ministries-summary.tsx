import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { formatMoney, formatMoneyCompact } from "@/lib/format-money";
import type { MinistriesTotals } from "../utils";

interface MinistriesSummaryProps {
  totals: MinistriesTotals;
}

export function MinistriesSummary({ totals }: MinistriesSummaryProps) {
  const executedPercent =
    totals.pesosBudget > 0 ? Math.round((totals.pesosExecuted / totals.pesosBudget) * 100) : 0;

  return (
    <StatCardGrid>
      <StatCard
        detail="Cada uno con líder asignado"
        highlighted={true}
        label="Ministerios activos"
        value={String(totals.count)}
      />
      <StatCard detail="Personas sirviendo" label="Voluntarios" value={String(totals.volunteers)} />
      <StatCard
        detail={`Más ${formatMoney(totals.dollarsBudget, "USD")} en dólares`}
        label="Presupuesto anual"
        value={formatMoneyCompact(totals.pesosBudget, "UYU")}
      />
      <StatCard detail="Del presupuesto total" label="Ejecutado" value={`${executedPercent} %`} />
    </StatCardGrid>
  );
}
