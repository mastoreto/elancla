import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CircleDollarSign, Heart } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatMovementAmount, MOVEMENTS_PAGE_SIZE } from "../utils";

interface MovementsTableProps {
  movements: Movement[];
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const GRID = cn(
  "sm:grid sm:grid-cols-[70px_1.7fr_110px_1.3fr_140px] sm:items-center sm:gap-3.5 sm:px-[18px]",
);

const movementsTableMovementsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  head: cn(
    GRID,
    "hidden rounded-[14px] bg-secondary py-3 text-xs font-bold text-[var(--tinta-suave)]",
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    GRID,
    "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
  ),
  date: cn("text-[var(--tinta-suave)]"),
  concept: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  bubbleIcon: cn("size-[17px]"),
  conceptText: cn("flex min-w-0 flex-col gap-0.5"),
  conceptName: cn("font-bold"),
  conceptDetail: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  project: cn("text-[var(--tinta-suave)]"),
  amount: cn("text-right font-bold whitespace-nowrap tabular-nums sm:text-right"),
  income: cn("text-[var(--vida)]"),
  expense: cn("text-primary"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function MovementsTable({
  movements,
  total,
  page,
  pageCount,
  onPageChange,
}: MovementsTableProps) {
  return (
    <BoardCard className={movementsTableMovementsPage.card}>
      <div aria-hidden="true" className={movementsTableMovementsPage.head}>
        <span>Fecha</span>
        <span>Concepto</span>
        <span>Tipo</span>
        <span>Proyecto</span>
        <span>Monto</span>
      </div>

      {movements.length === 0 ? (
        <p className={movementsTableMovementsPage.empty}>No hay movimientos encontrados.</p>
      ) : (
        <ul className={movementsTableMovementsPage.list}>
          {movements.map((movement) => {
            const isIncome = movement.type === "income";
            const Icon = isIncome ? Heart : CircleDollarSign;
            return (
              <li className={movementsTableMovementsPage.row} key={movement.id}>
                <span className={movementsTableMovementsPage.date}>
                  {format(new Date(movement.date), "d MMM", { locale: es })}
                </span>
                <span className={movementsTableMovementsPage.concept}>
                  <IconBubble
                    className={movementsTableMovementsPage.bubble}
                    tone={isIncome ? "green" : "rose"}
                  >
                    <Icon aria-hidden="true" className={movementsTableMovementsPage.bubbleIcon} />
                  </IconBubble>
                  <span className={movementsTableMovementsPage.conceptText}>
                    <span className={movementsTableMovementsPage.conceptName}>
                      {movement.concept}
                    </span>
                    <span className={movementsTableMovementsPage.conceptDetail}>
                      {movement.description}
                    </span>
                  </span>
                </span>
                <span>
                  <StatusPill tone={isIncome ? "green" : "rose"}>
                    {isIncome ? "Ingreso" : "Egreso"}
                  </StatusPill>
                </span>
                <span className={movementsTableMovementsPage.project}>
                  {movement.project ?? "—"}
                </span>
                <b
                  className={cn(
                    movementsTableMovementsPage.amount,
                    isIncome
                      ? movementsTableMovementsPage.income
                      : movementsTableMovementsPage.expense,
                  )}
                >
                  {formatMovementAmount(movement)}
                </b>
              </li>
            );
          })}
        </ul>
      )}

      <BoardPagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
        pageSize={MOVEMENTS_PAGE_SIZE}
        total={total}
      />
    </BoardCard>
  );
}
