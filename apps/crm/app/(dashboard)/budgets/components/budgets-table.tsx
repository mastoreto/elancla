import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PencilLine, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { ProgressBar, type ProgressBarTone } from "@/components/dashboard/board/progress-bar";
import { RowIconButton, rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Budget } from "../types";
import {
  BUDGETS_PAGE_SIZE,
  type BudgetUsageLevel,
  getBudgetOwner,
  getUsageLevel,
  getUsagePercent,
} from "../utils";

interface BudgetsTableProps {
  budgets: Budget[];
  total: number;
  page: number;
  pageCount: number;
  errorMessage?: string | null;
  onPageChange: (page: number) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const COLUMNS = "1.6fr 80px 130px 1.2fr 130px 90px";
const HEADERS = ["Presupuesto", "Moneda", "Total", "Uso", "Vigencia", ""];

const USAGE_TONE = {
  normal: "green",
  near: "gold",
  over: "rose",
} satisfies Record<BudgetUsageLevel, ProgressBarTone>;

/** "ene – jun 2026" when both ends fall in the same year, otherwise with both years. */
function formatValidity(start: Date, end: Date): string {
  const startMonth = format(start, "MMM", { locale: es });
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} – ${format(end, "MMM yyyy", { locale: es })}`;
  }
  return `${format(start, "MMM yyyy", { locale: es })} – ${format(end, "MMM yyyy", { locale: es })}`;
}

const budgetsTableBudgetsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  name: cn("flex min-w-0 flex-col gap-0.5"),
  nameText: cn("font-bold"),
  owner: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  currency: cn("text-[var(--tinta-suave)]"),
  total: cn("font-bold whitespace-nowrap tabular-nums"),
  usage: cn("flex w-full flex-col gap-2"),
  usageLabel: cn("text-xs text-[var(--tinta-apagada)]"),
  validity: cn("text-[13.5px] text-[var(--tinta-suave)]"),
  actions: cn("flex justify-end gap-1.5"),
  icon: cn("size-4"),
  message: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
  error: cn("py-10 text-center text-sm text-primary"),
};

export function BudgetsTable({
  budgets,
  total,
  page,
  pageCount,
  errorMessage,
  onPageChange,
  onEdit,
  onDelete,
}: BudgetsTableProps) {
  return (
    <BoardCard className={budgetsTableBudgetsPage.card}>
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />

      {errorMessage ? (
        <p className={budgetsTableBudgetsPage.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {!errorMessage && budgets.length === 0 ? (
        <p className={budgetsTableBudgetsPage.message}>No hay presupuestos registrados.</p>
      ) : null}

      {budgets.length > 0 ? (
        <BoardTableList>
          {budgets.map((budget) => {
            const percent = getUsagePercent(budget);
            return (
              <BoardTableRow columns={COLUMNS} key={budget.id}>
                <div className={budgetsTableBudgetsPage.name}>
                  <span className={budgetsTableBudgetsPage.nameText}>{budget.name}</span>
                  <span className={budgetsTableBudgetsPage.owner}>{getBudgetOwner(budget)}</span>
                </div>
                <span className={budgetsTableBudgetsPage.currency}>{budget.currency}</span>
                <b className={budgetsTableBudgetsPage.total}>
                  {formatMoney(budget.totalAmount, budget.currency)}
                </b>
                <div className={budgetsTableBudgetsPage.usage}>
                  <ProgressBar
                    label={`${budget.name}: ${percent} % usado`}
                    tone={USAGE_TONE[getUsageLevel(percent)]}
                    value={percent}
                  />
                  <span className={budgetsTableBudgetsPage.usageLabel}>{percent} % usado</span>
                </div>
                <span className={budgetsTableBudgetsPage.validity}>
                  {formatValidity(budget.startDate, budget.endDate)}
                </span>
                <div className={budgetsTableBudgetsPage.actions}>
                  <RowIconButton label={`Editar ${budget.name}`} onClick={() => onEdit(budget)}>
                    <PencilLine aria-hidden="true" className={budgetsTableBudgetsPage.icon} />
                  </RowIconButton>
                  <ConfirmDeleteDialog
                    confirmLabel="Eliminar presupuesto"
                    onConfirm={() => onDelete(budget)}
                    title="Eliminar presupuesto"
                    trigger={
                      <button
                        aria-label={`Eliminar ${budget.name}`}
                        className={rowIconButtonClass}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className={budgetsTableBudgetsPage.icon} />
                      </button>
                    }
                  >
                    ¿Seguro que quieres eliminar “{budget.name}”? Esta acción no se puede deshacer.
                  </ConfirmDeleteDialog>
                </div>
              </BoardTableRow>
            );
          })}
        </BoardTableList>
      ) : null}

      <BoardPagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
        pageSize={BUDGETS_PAGE_SIZE}
        total={total}
      />
    </BoardCard>
  );
}
