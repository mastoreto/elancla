import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { formatMoney } from "@/lib/format-money";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectMovementsCardProps {
  title: string;
  subtitle: string;
  movements: Movement[];
  action?: React.ReactNode;
}

const projectMovementsCardProjectsPage = {
  head: cn(
    "hidden grid-cols-[80px_1fr_130px] gap-3.5 rounded-[14px] bg-secondary px-[18px] py-3 text-xs font-bold text-[var(--tinta-suave)] sm:grid",
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    "grid grid-cols-[64px_1fr_auto] items-center gap-3.5 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
    "sm:grid-cols-[80px_1fr_130px] sm:px-[18px]",
  ),
  date: cn("text-[var(--tinta-suave)]"),
  concept: cn("flex min-w-0 flex-col gap-0.5"),
  conceptName: cn("font-bold"),
  conceptDetail: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  amount: cn("font-bold whitespace-nowrap tabular-nums"),
  income: cn("text-[var(--vida)]"),
  expense: cn("text-primary"),
  empty: cn("py-8 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function ProjectMovementsCard({
  title,
  subtitle,
  movements,
  action,
}: ProjectMovementsCardProps) {
  return (
    <BoardCard>
      <BoardCardHeader action={action} subtitle={subtitle} title={title} />
      <div aria-hidden="true" className={projectMovementsCardProjectsPage.head}>
        <span>Fecha</span>
        <span>Concepto</span>
        <span>Monto</span>
      </div>
      {movements.length === 0 ? (
        <p className={projectMovementsCardProjectsPage.empty}>Todavía no hay movimientos.</p>
      ) : (
        <ul className={projectMovementsCardProjectsPage.list}>
          {movements.map((movement) => {
            const isIncome = movement.type === "income";
            return (
              <li className={projectMovementsCardProjectsPage.row} key={movement.id}>
                <span className={projectMovementsCardProjectsPage.date}>
                  {format(parseISO(movement.date), "dd MMM", { locale: es })}
                </span>
                <span className={projectMovementsCardProjectsPage.concept}>
                  <span className={projectMovementsCardProjectsPage.conceptName}>
                    {movement.concept}
                  </span>
                  <span className={projectMovementsCardProjectsPage.conceptDetail}>
                    {movement.description}
                  </span>
                </span>
                <b
                  className={cn(
                    projectMovementsCardProjectsPage.amount,
                    isIncome
                      ? projectMovementsCardProjectsPage.income
                      : projectMovementsCardProjectsPage.expense,
                  )}
                >
                  {isIncome ? "+" : "−"} {formatMoney(movement.amount, movement.currency)}
                </b>
              </li>
            );
          })}
        </ul>
      )}
    </BoardCard>
  );
}
