import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { formatMoneyCompact } from "@/lib/format-money";
import type { InventoryItem } from "../types";
import {
  countByStatus,
  countNeedingAttention,
  describeAttention,
  describeLoans,
  getTotalUnits,
  sumInventoryValues,
} from "../utils";

interface InventorySummaryProps {
  items: readonly InventoryItem[];
}

export function InventorySummary({ items }: InventorySummaryProps) {
  const totals = sumInventoryValues(items);

  return (
    <StatCardGrid>
      <StatCard
        detail={`${getTotalUnits(items)} unidades en total`}
        highlighted={true}
        label="Ítems registrados"
        value={String(items.length)}
      />
      <StatCard
        detail={`Más ${formatMoneyCompact(totals.uyu, "UYU")} en moneda local`}
        label="Valor estimado"
        value={formatMoneyCompact(totals.usd, "USD")}
      />
      <StatCard
        detail={describeLoans(items)}
        label="En préstamo"
        value={String(countByStatus(items, "Prestado"))}
      />
      <StatCard
        detail={describeAttention(items)}
        label="Requieren atención"
        value={String(countNeedingAttention(items))}
      />
    </StatCardGrid>
  );
}
