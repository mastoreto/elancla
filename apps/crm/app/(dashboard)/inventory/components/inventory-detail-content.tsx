"use client";

import {
  Check,
  Download,
  Handshake,
  Pencil,
  Receipt,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { BoardTimeline, type BoardTimelineItem } from "@/components/dashboard/board/board-timeline";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import type { InventoryHistoryKind, InventoryItemDetail, InventoryStatus } from "../types";
import { InventoryDetailCard, type InventoryFact } from "./inventory-detail-card";
import { InventoryDetailHero } from "./inventory-detail-hero";
import { InventoryLendDialog } from "./inventory-lend-dialog";

interface InventoryDetailContentProps {
  item: InventoryItemDetail;
}

const HISTORY_APPEARANCE = {
  created: { icon: Check, tone: "green" },
  edit: { icon: Pencil, tone: "ink" },
  status: { icon: RefreshCw, tone: "gold" },
  loan: { icon: Handshake, tone: "gold" },
  repair: { icon: TriangleAlert, tone: "rose" },
} satisfies Record<InventoryHistoryKind, Pick<BoardTimelineItem, "icon" | "tone">>;

const inventoryDetailContentInventoryPage = {
  page: cn("flex flex-col gap-[18px]"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-3"),
  invoice: cn("mt-3.5 flex items-center gap-3 rounded-[18px] bg-secondary px-3.5 py-3"),
  invoiceIcon: cn("size-[34px]"),
  invoiceName: cn("flex-1 text-[13.5px] font-semibold"),
  download: cn(
    "inline-flex size-8 items-center justify-center rounded-full bg-card shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  glyph: cn("size-4"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

function buildSpecFacts(item: InventoryItemDetail): InventoryFact[] {
  return [
    { label: "Categoría", value: item.category },
    { label: "Cantidad", value: `${item.quantity} ${item.quantity === 1 ? "unidad" : "unidades"}` },
    { label: "Marca y modelo", value: `${item.brand} ${item.model}`.replace(/^— —$/, "—") },
    { label: "N.º de serie", value: item.serialNumber },
    { label: "Ubicación", value: item.location },
    { label: "Responsable", value: item.responsible },
  ];
}

function buildAcquisitionFacts(item: InventoryItemDetail): InventoryFact[] {
  return [
    { label: "Fecha de compra", value: item.acquiredOn },
    { label: "Proveedor", value: item.supplier },
    { label: "Valor de compra", value: item.purchaseValue },
    { label: "Valor estimado hoy", value: item.value },
    { label: "Garantía", value: item.warranty },
  ];
}

export function InventoryDetailContent({ item }: InventoryDetailContentProps) {
  const [status, setStatus] = useState<InventoryStatus>(item.status);
  const [lendOpen, setLendOpen] = useState(false);

  const handleStatusChange = (next: InventoryStatus) => {
    if (next === "Prestado") {
      setLendOpen(true);
      return;
    }
    setStatus(next);
  };

  const timeline: BoardTimelineItem[] = [...item.history].reverse().map((entry) => ({
    id: `${entry.date}-${entry.event}`,
    ...HISTORY_APPEARANCE[entry.kind],
    title: entry.event,
    detail: entry.detail,
    time: entry.date,
  }));

  return (
    <div className={inventoryDetailContentInventoryPage.page}>
      <InventoryDetailHero item={item} onStatusChange={handleStatusChange} status={status} />

      <div className={inventoryDetailContentInventoryPage.columns}>
        <InventoryDetailCard
          facts={buildSpecFacts(item)}
          subtitle="Ficha técnica"
          title="Datos del ítem"
        />
        <InventoryDetailCard
          facts={buildAcquisitionFacts(item)}
          subtitle="Origen y valor"
          title="Adquisición"
        >
          {item.invoiceFile ? (
            <div className={inventoryDetailContentInventoryPage.invoice}>
              <IconBubble className={inventoryDetailContentInventoryPage.invoiceIcon} tone="ink">
                <Receipt aria-hidden="true" className={inventoryDetailContentInventoryPage.glyph} />
              </IconBubble>
              <span className={inventoryDetailContentInventoryPage.invoiceName}>
                {item.invoiceFile}
              </span>
              <button
                aria-label={`Descargar ${item.invoiceFile}`}
                className={inventoryDetailContentInventoryPage.download}
                type="button"
              >
                <Download
                  aria-hidden="true"
                  className={inventoryDetailContentInventoryPage.glyph}
                />
              </button>
            </div>
          ) : null}
        </InventoryDetailCard>
        <InventoryDetailCard subtitle="Cambios y movimientos" title="Historial">
          {timeline.length === 0 ? (
            <p className={inventoryDetailContentInventoryPage.empty}>Sin movimientos todavía.</p>
          ) : (
            <BoardTimeline items={timeline} />
          )}
        </InventoryDetailCard>
      </div>

      <InventoryLendDialog
        itemName={`${item.name} · ${item.code}`}
        onLent={() => setStatus("Prestado")}
        onOpenChange={setLendOpen}
        open={lendOpen}
      />
    </div>
  );
}
