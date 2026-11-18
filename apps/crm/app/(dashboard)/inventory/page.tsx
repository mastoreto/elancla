import { Boxes, HandCoins, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardMetricStrip,
  DashboardPageHeader,
} from "@/src/componentes/dashboard";
import { InventoryTable } from "./components/inventory-table";
import { inventoryItems } from "./data/inventory-items";
import { countByStatus, countNeedingAttention, getTotalUnits } from "./utils/inventory-stats";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function InventoryPage() {
  return (
    <>
      <DashboardPageHeader
        actions={
          <Button className="rounded-full" type="button">
            <Plus aria-hidden="true" />
            Nuevo ítem
          </Button>
        }
        description="Todo lo que la iglesia tiene: dónde está, en qué estado y quién responde por cada ítem."
        emphasis="en orden"
        kicker="Gobierno"
        title="Inventario"
      />

      <DashboardMetricStrip
        metrics={[
          {
            label: "Ítems registrados",
            value: String(inventoryItems.length),
            detail: `${getTotalUnits(inventoryItems)} unidades en total`,
            icon: Boxes,
            accent: true,
          },
          {
            label: "En préstamo",
            value: String(countByStatus(inventoryItems, "Prestado")),
            detail: "Pendientes de devolución",
            icon: HandCoins,
          },
          {
            label: "Requieren atención",
            value: String(countNeedingAttention(inventoryItems)),
            detail: "En reparación o en estado regular",
            icon: Wrench,
            tone: "down",
          },
        ]}
      />

      <DashboardCard>
        <DashboardCardHeader subtitle={`${inventoryItems.length} ítems`} title="Ítems" />
        <InventoryTable items={inventoryItems} />
      </DashboardCard>
    </>
  );
}
