import { Download, FileText, PencilLine, Trash2 } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Receipt } from "../types";
import { formatLongDate } from "../utils";

interface ReceiptDetailPanelProps {
  receipt: Receipt | null;
  onEdit: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
}

const receiptDetailPanelReceiptsPage = {
  card: cn("flex flex-col gap-3.5 p-6"),
  header: cn("flex items-center gap-2.5"),
  title: cn("flex-1 font-display text-[21px] font-medium"),
  iconButton: cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-(--granada-50)",
  ),
  icon: cn("size-4"),
  preview: cn(
    "flex h-[230px] flex-col items-center justify-center gap-2 rounded-[22px] bg-secondary text-[var(--tinta-apagada)]",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
  ),
  previewBubble: cn("size-[52px]"),
  previewIcon: cn("size-[22px]"),
  fileName: cn("text-[13.5px] font-bold text-foreground"),
  fileHint: cn("text-xs"),
  facts: cn("flex flex-col"),
  fact: cn("flex justify-between gap-3 border-b border-border/60 py-[11px] text-sm"),
  factLabel: cn("text-[var(--tinta-apagada)]"),
  factValue: cn("text-right font-bold"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

/** "/demo/boletas/boleta-renta-marzo.pdf" -> "boleta-renta-marzo.pdf" */
function getFileName(receipt: Receipt): string {
  return receipt.fileUrl?.split("/").at(-1) ?? "Sin archivo adjunto";
}

export function ReceiptDetailPanel({ receipt, onEdit, onDelete }: ReceiptDetailPanelProps) {
  if (!receipt) {
    return (
      <BoardCard className={receiptDetailPanelReceiptsPage.card}>
        <p className={receiptDetailPanelReceiptsPage.empty}>Selecciona una boleta para verla.</p>
      </BoardCard>
    );
  }

  const facts = [
    { label: "Proveedor", value: receipt.provider },
    { label: "Monto", value: formatMoney(receipt.amount, receipt.currency) },
    { label: "Fecha", value: formatLongDate(receipt.date) },
    { label: "Relacionada con", value: receipt.relatedEntity },
  ];

  return (
    <BoardCard className={receiptDetailPanelReceiptsPage.card}>
      <div className={receiptDetailPanelReceiptsPage.header}>
        <h2 className={receiptDetailPanelReceiptsPage.title}>{receipt.number}</h2>
        {receipt.fileUrl ? (
          <a
            aria-label="Descargar archivo"
            className={receiptDetailPanelReceiptsPage.iconButton}
            download={true}
            href={receipt.fileUrl}
          >
            <Download aria-hidden="true" className={receiptDetailPanelReceiptsPage.icon} />
          </a>
        ) : null}
        <button
          aria-label="Editar boleta"
          className={receiptDetailPanelReceiptsPage.iconButton}
          onClick={() => onEdit(receipt)}
          type="button"
        >
          <PencilLine aria-hidden="true" className={receiptDetailPanelReceiptsPage.icon} />
        </button>
        <button
          aria-label="Eliminar boleta"
          className={receiptDetailPanelReceiptsPage.iconButton}
          onClick={() => onDelete(receipt)}
          type="button"
        >
          <Trash2 aria-hidden="true" className={receiptDetailPanelReceiptsPage.icon} />
        </button>
      </div>

      <div className={receiptDetailPanelReceiptsPage.preview}>
        <IconBubble className={receiptDetailPanelReceiptsPage.previewBubble} tone="gold">
          <FileText aria-hidden="true" className={receiptDetailPanelReceiptsPage.previewIcon} />
        </IconBubble>
        <b className={receiptDetailPanelReceiptsPage.fileName}>{getFileName(receipt)}</b>
        <span className={receiptDetailPanelReceiptsPage.fileHint}>Vista previa del archivo</span>
      </div>

      <dl className={receiptDetailPanelReceiptsPage.facts}>
        {facts.map((fact) => (
          <div className={receiptDetailPanelReceiptsPage.fact} key={fact.label}>
            <dt className={receiptDetailPanelReceiptsPage.factLabel}>{fact.label}</dt>
            <dd className={receiptDetailPanelReceiptsPage.factValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </BoardCard>
  );
}
