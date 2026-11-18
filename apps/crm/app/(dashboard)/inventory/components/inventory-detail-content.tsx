import { Pencil } from "lucide-react";
import Link from "next/link";
import { DashboardCard, DashboardCardHeader, DashboardPageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { InventoryItemDetail } from "../types";
import { InventoryDeleteButton } from "./inventory-delete-button";
import { InventoryLendDialog } from "./inventory-lend-dialog";
import { InventoryStatusBadge } from "./inventory-status-badge";

interface InventoryDetailContentProps {
  item: InventoryItemDetail;
}

const inventoryDetailContentInventoryPage = {
  layout: cn("grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"),
  column: cn("flex flex-col gap-6"),
  action: cn("rounded-full"),
  facts: cn("grid gap-4 sm:grid-cols-2"),
  factLabel: cn("text-xs text-muted-foreground"),
  factValue: cn("mt-1 text-sm font-medium"),
  timeline: cn("divide-y divide-border"),
  entry: cn("py-3"),
  entryEvent: cn("text-sm font-semibold"),
  entryMeta: cn("text-xs text-muted-foreground"),
  empty: cn("py-6 text-center text-sm text-muted-foreground"),
  notes: cn("text-sm leading-6 text-tinta-suave"),
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={inventoryDetailContentInventoryPage.factLabel}>{label}</dt>
      <dd className={inventoryDetailContentInventoryPage.factValue}>{value}</dd>
    </div>
  );
}

export function InventoryDetailContent({ item }: InventoryDetailContentProps) {
  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <InventoryStatusBadge status={item.status} />
            <InventoryLendDialog itemName={item.name} />
            <Button asChild={true} className={inventoryDetailContentInventoryPage.action}>
              <Link href={getChurchRoutePath("inventory", item.id, "edit")}>
                <Pencil aria-hidden="true" />
                Editar
              </Link>
            </Button>
            <InventoryDeleteButton itemName={item.name} />
          </>
        }
        description={`${item.code} · ${item.category} · ${item.location}`}
        kicker="Inventario"
        title={item.name}
      />

      <div className={inventoryDetailContentInventoryPage.layout}>
        <div className={inventoryDetailContentInventoryPage.column}>
          <DashboardCard>
            <DashboardCardHeader subtitle="Datos del ítem" title="Ficha técnica" />
            <dl className={inventoryDetailContentInventoryPage.facts}>
              <Fact label="Marca" value={item.brand} />
              <Fact label="Modelo" value={item.model} />
              <Fact label="N.º de serie" value={item.serialNumber} />
              <Fact label="Cantidad" value={String(item.quantity)} />
              <Fact label="Responsable" value={item.responsible} />
              <Fact label="Ubicación" value={item.location} />
            </dl>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader subtitle="Cómo llegó a la iglesia" title="Adquisición" />
            <dl className={inventoryDetailContentInventoryPage.facts}>
              <Fact label="Fecha" value={item.acquiredOn} />
              <Fact label="Modo" value={item.acquisitionMode} />
              <Fact label="Valor estimado" value={item.value} />
            </dl>
            <p className={inventoryDetailContentInventoryPage.notes}>{item.notes}</p>
          </DashboardCard>
        </div>

        <DashboardCard>
          <DashboardCardHeader subtitle="Préstamos, reparaciones y cambios" title="Historial" />
          {item.history.length === 0 ? (
            <p className={inventoryDetailContentInventoryPage.empty}>Sin movimientos todavía.</p>
          ) : (
            <ol className={inventoryDetailContentInventoryPage.timeline}>
              {item.history.map((entry) => (
                <li
                  className={inventoryDetailContentInventoryPage.entry}
                  key={entry.date + entry.event}
                >
                  <p className={inventoryDetailContentInventoryPage.entryEvent}>{entry.event}</p>
                  <p className={inventoryDetailContentInventoryPage.entryMeta}>
                    {entry.date} · {entry.detail}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </DashboardCard>
      </div>
    </>
  );
}
