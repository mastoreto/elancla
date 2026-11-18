import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Receipt } from "../types";
import { formatShortDate, RECEIPTS_PAGE_SIZE, stripRelationKind } from "../utils";

interface ReceiptsTableProps {
  receipts: Receipt[];
  selectedId: string | null;
  total: number;
  page: number;
  pageCount: number;
  errorMessage?: string | null;
  onPageChange: (page: number) => void;
  onSelect: (receipt: Receipt) => void;
}

const GRID = cn(
  "sm:grid sm:grid-cols-[120px_1.4fr_110px_70px_1.2fr] sm:items-center sm:gap-3.5 sm:px-[18px]",
);

const receiptsTableReceiptsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  head: cn(
    GRID,
    "hidden rounded-[14px] bg-secondary py-3 text-xs font-bold text-[var(--tinta-suave)]",
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    GRID,
    "relative flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
  ),
  rowSelected: cn("border-b-0 bg-(--granada-50)"),
  number: cn(
    "text-left text-[13.5px] font-bold after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring",
  ),
  provider: cn("min-w-0 font-bold"),
  amount: cn("font-bold whitespace-nowrap tabular-nums"),
  date: cn("text-[var(--tinta-suave)]"),
  related: cn("text-[13px] text-[var(--tinta-suave)]"),
  message: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
  error: cn("py-10 text-center text-sm text-primary"),
};

export function ReceiptsTable({
  receipts,
  selectedId,
  total,
  page,
  pageCount,
  errorMessage,
  onPageChange,
  onSelect,
}: ReceiptsTableProps) {
  return (
    <BoardCard className={receiptsTableReceiptsPage.card}>
      <div aria-hidden="true" className={receiptsTableReceiptsPage.head}>
        <span>N.º</span>
        <span>Proveedor</span>
        <span>Monto</span>
        <span>Fecha</span>
        <span>Relacionada con</span>
      </div>

      {errorMessage ? (
        <p className={receiptsTableReceiptsPage.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!errorMessage && receipts.length === 0 ? (
        <p className={receiptsTableReceiptsPage.message}>No hay boletas registradas.</p>
      ) : null}

      {receipts.length > 0 ? (
        <ul className={receiptsTableReceiptsPage.list}>
          {receipts.map((receipt) => (
            <li
              className={cn(
                receiptsTableReceiptsPage.row,
                receipt.id === selectedId && receiptsTableReceiptsPage.rowSelected,
              )}
              key={receipt.id}
            >
              <button
                aria-pressed={receipt.id === selectedId}
                className={receiptsTableReceiptsPage.number}
                onClick={() => onSelect(receipt)}
                type="button"
              >
                {receipt.number}
              </button>
              <span className={receiptsTableReceiptsPage.provider}>{receipt.provider}</span>
              <b className={receiptsTableReceiptsPage.amount}>
                {formatMoney(receipt.amount, receipt.currency)}
              </b>
              <span className={receiptsTableReceiptsPage.date}>
                {formatShortDate(receipt.date)}
              </span>
              <span className={receiptsTableReceiptsPage.related}>
                {stripRelationKind(receipt.relatedEntity)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <BoardPagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
        pageSize={RECEIPTS_PAGE_SIZE}
        total={total}
      />
    </BoardCard>
  );
}
