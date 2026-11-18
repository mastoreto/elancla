import { Trash2 } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { cn } from "@/lib/utils";
import type { Voucher } from "../types";

interface VoucherJustificationCardProps {
  voucher: Voucher | null;
  onDelete: (voucher: Voucher) => void;
}

const voucherJustificationCardVouchersPage = {
  card: cn("p-[22px]"),
  header: cn("mb-3.5 flex items-start gap-2.5"),
  heading: cn("flex flex-1 flex-col gap-[3px]"),
  title: cn("font-display text-[21px] font-medium tracking-tight"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
  delete: cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-(--granada-50)",
  ),
  deleteIcon: cn("size-4"),
  text: cn("text-[13.5px] leading-[1.6] text-[var(--tinta-suave)]"),
};

export function VoucherJustificationCard({ voucher, onDelete }: VoucherJustificationCardProps) {
  return (
    <BoardCard className={voucherJustificationCardVouchersPage.card}>
      <div className={voucherJustificationCardVouchersPage.header}>
        <div className={voucherJustificationCardVouchersPage.heading}>
          <h2 className={voucherJustificationCardVouchersPage.title}>Justificación</h2>
          <span className={voucherJustificationCardVouchersPage.subtitle}>
            Comprobante seleccionado
          </span>
        </div>
        {voucher ? (
          <button
            aria-label="Eliminar comprobante"
            className={voucherJustificationCardVouchersPage.delete}
            onClick={() => onDelete(voucher)}
            type="button"
          >
            <Trash2
              aria-hidden="true"
              className={voucherJustificationCardVouchersPage.deleteIcon}
            />
          </button>
        ) : null}
      </div>
      <p className={voucherJustificationCardVouchersPage.text}>
        {voucher
          ? (voucher.justification ?? "Sin justificación registrada.")
          : "Selecciona un comprobante para ver su justificación."}
      </p>
    </BoardCard>
  );
}
