import { Heart, Wallet } from "lucide-react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import type { ReportMovementRow } from "../types";

const COLUMNS = "70px 1.7fr 110px 1.3fr 140px";
const HEAD_LABELS = ["Fecha", "Concepto", "Tipo", "Proyecto", "Monto"];

const reportMovementsTableReportsPage = {
  muted: cn("text-[var(--tinta-suave)]"),
  concept: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  icon: cn("size-[18px]"),
  text: cn("flex min-w-0 flex-col gap-0.5"),
  name: cn("text-sm font-bold"),
  note: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  amount: cn("text-right text-sm whitespace-nowrap tabular-nums"),
  income: cn("text-[var(--vida)]"),
  expense: cn("text-primary"),
};

interface ReportMovementsTableProps {
  movements: ReportMovementRow[];
  total: number;
}

export function ReportMovementsTable({ movements, total }: ReportMovementsTableProps) {
  return (
    <BoardCard>
      <BoardCardHeader
        subtitle={`Primeros ${movements.length} de ${total}`}
        title="Movimientos del reporte"
      />
      <BoardTableHead columns={COLUMNS} labels={HEAD_LABELS} />
      <BoardTableList>
        {movements.map((movement) => {
          const isIncome = movement.type === "INCOME";
          return (
            <BoardTableRow columns={COLUMNS} key={movement.id}>
              <span className={reportMovementsTableReportsPage.muted}>{movement.dateLabel}</span>
              <div className={reportMovementsTableReportsPage.concept}>
                <IconBubble
                  className={reportMovementsTableReportsPage.bubble}
                  tone={isIncome ? "green" : "rose"}
                >
                  {isIncome ? (
                    <Heart aria-hidden="true" className={reportMovementsTableReportsPage.icon} />
                  ) : (
                    <Wallet aria-hidden="true" className={reportMovementsTableReportsPage.icon} />
                  )}
                </IconBubble>
                <div className={reportMovementsTableReportsPage.text}>
                  <span className={reportMovementsTableReportsPage.name}>{movement.concept}</span>
                  <span className={reportMovementsTableReportsPage.note}>{movement.note}</span>
                </div>
              </div>
              <span>
                <StatusPill tone={isIncome ? "green" : "rose"}>
                  {isIncome ? "Ingreso" : "Egreso"}
                </StatusPill>
              </span>
              <span className={reportMovementsTableReportsPage.muted}>{movement.project}</span>
              <b
                className={cn(
                  reportMovementsTableReportsPage.amount,
                  isIncome
                    ? reportMovementsTableReportsPage.income
                    : reportMovementsTableReportsPage.expense,
                )}
              >
                {movement.amountLabel}
              </b>
            </BoardTableRow>
          );
        })}
      </BoardTableList>
    </BoardCard>
  );
}
