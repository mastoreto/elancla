import { ShieldCheck } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";

const GUIDANCE = [
  "Cuando el gasto no tiene boleta del proveedor.",
  "Siempre con una justificación clara de por qué no hay respaldo fiscal.",
  "Debe llevar responsable, fecha y el movimiento o solicitud relacionados.",
];

const voucherGuidanceCardVouchersPage = {
  card: cn("p-6"),
  header: cn("mb-3 flex items-center gap-3"),
  bubble: cn("size-10"),
  bubbleIcon: cn("size-5"),
  title: cn("font-display text-xl font-medium"),
  list: cn("flex flex-col gap-2.5 text-[13.5px] leading-[1.55] text-[var(--tinta-suave)]"),
};

export function VoucherGuidanceCard() {
  return (
    <BoardCard className={voucherGuidanceCardVouchersPage.card} surface="gold">
      <div className={voucherGuidanceCardVouchersPage.header}>
        <IconBubble className={voucherGuidanceCardVouchersPage.bubble} tone="gold">
          <ShieldCheck aria-hidden="true" className={voucherGuidanceCardVouchersPage.bubbleIcon} />
        </IconBubble>
        <h2 className={voucherGuidanceCardVouchersPage.title}>¿Cuándo usar un comprobante?</h2>
      </div>
      <ul className={voucherGuidanceCardVouchersPage.list}>
        {GUIDANCE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </BoardCard>
  );
}
