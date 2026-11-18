import { Eye, PencilLine } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Voucher } from "../types";
import { formatShortDate, getInitials, VOUCHERS_PAGE_SIZE } from "../utils";

interface VouchersTableProps {
  vouchers: Voucher[];
  selectedId: string | null;
  total: number;
  page: number;
  pageCount: number;
  errorMessage?: string | null;
  onPageChange: (page: number) => void;
  onSelect: (voucher: Voucher) => void;
  onEdit: (voucher: Voucher) => void;
}

const GRID = cn(
  "sm:grid sm:grid-cols-[1.5fr_110px_70px_1.2fr_1.1fr_80px] sm:items-center sm:gap-3.5 sm:px-[18px]",
);

const vouchersTableVouchersPage = {
  card: cn("flex flex-col gap-1 p-5"),
  head: cn(
    "hidden rounded-[14px] bg-secondary py-3 text-xs font-bold text-[var(--tinta-suave)]",
    GRID,
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    GRID,
    "relative flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
  ),
  rowSelected: cn("border-b-0 bg-(--granada-50)"),
  description: cn(
    "min-w-0 text-left font-bold after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring",
  ),
  amount: cn("font-bold whitespace-nowrap tabular-nums"),
  date: cn("text-[var(--tinta-suave)]"),
  responsible: cn("flex min-w-0 items-center gap-2.5"),
  avatar: cn(
    "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-(image:--grad-avatar) text-xs font-extrabold text-[var(--oro-texto)] shadow-[0_0_0_2px_#fff]",
  ),
  responsibleName: cn("min-w-0 font-medium"),
  related: cn("text-[13px] text-[var(--tinta-suave)]"),
  actions: cn("relative z-10 flex justify-end gap-1.5"),
  action: cn(
    "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-(--granada-50)",
  ),
  actionIcon: cn("size-4"),
  message: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
  error: cn("py-10 text-center text-sm text-primary"),
};

export function VouchersTable({
  vouchers,
  selectedId,
  total,
  page,
  pageCount,
  errorMessage,
  onPageChange,
  onSelect,
  onEdit,
}: VouchersTableProps) {
  return (
    <BoardCard className={vouchersTableVouchersPage.card}>
      <div aria-hidden="true" className={vouchersTableVouchersPage.head}>
        <span>Descripción</span>
        <span>Monto</span>
        <span>Fecha</span>
        <span>Responsable</span>
        <span>Relacionado</span>
        <span />
      </div>

      {errorMessage ? (
        <p className={vouchersTableVouchersPage.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!errorMessage && vouchers.length === 0 ? (
        <p className={vouchersTableVouchersPage.message}>No hay comprobantes registrados.</p>
      ) : null}

      {vouchers.length > 0 ? (
        <ul className={vouchersTableVouchersPage.list}>
          {vouchers.map((voucher) => (
            <li
              className={cn(
                vouchersTableVouchersPage.row,
                voucher.id === selectedId && vouchersTableVouchersPage.rowSelected,
              )}
              key={voucher.id}
            >
              <button
                aria-pressed={voucher.id === selectedId}
                className={vouchersTableVouchersPage.description}
                onClick={() => onSelect(voucher)}
                type="button"
              >
                {voucher.description}
              </button>
              <b className={vouchersTableVouchersPage.amount}>
                {formatMoney(voucher.amount, voucher.currency)}
              </b>
              <span className={vouchersTableVouchersPage.date}>
                {formatShortDate(voucher.date)}
              </span>
              <span className={vouchersTableVouchersPage.responsible}>
                <span aria-hidden="true" className={vouchersTableVouchersPage.avatar}>
                  {getInitials(voucher.responsible)}
                </span>
                <span className={vouchersTableVouchersPage.responsibleName}>
                  {voucher.responsible}
                </span>
              </span>
              <span className={vouchersTableVouchersPage.related}>{voucher.relatedEntity}</span>
              <span className={vouchersTableVouchersPage.actions}>
                <button
                  aria-label={`Ver ${voucher.description}`}
                  className={vouchersTableVouchersPage.action}
                  onClick={() => onSelect(voucher)}
                  type="button"
                >
                  <Eye aria-hidden="true" className={vouchersTableVouchersPage.actionIcon} />
                </button>
                <button
                  aria-label={`Editar ${voucher.description}`}
                  className={vouchersTableVouchersPage.action}
                  onClick={() => onEdit(voucher)}
                  type="button"
                >
                  <PencilLine aria-hidden="true" className={vouchersTableVouchersPage.actionIcon} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <BoardPagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
        pageSize={VOUCHERS_PAGE_SIZE}
        total={total}
      />
    </BoardCard>
  );
}
