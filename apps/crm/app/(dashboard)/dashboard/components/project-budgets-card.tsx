import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { cn } from "@/lib/utils";
import type { ProjectBudget } from "../data/summary";

const projectBudgetsCardDashboardPage = {
  list: cn("flex flex-col gap-4"),
  item: cn("flex flex-col gap-1.5"),
  name: cn("text-[13.5px] font-medium"),
  body: cn("flex w-full flex-col gap-2"),
  row: cn("flex justify-between text-[13px] text-[var(--tinta-apagada)] tabular-nums"),
  spent: cn("text-foreground"),
  percent: cn("text-[var(--vida)]"),
};

interface ProjectBudgetsCardProps {
  budgets: ProjectBudget[];
}

export function ProjectBudgetsCard({ budgets }: ProjectBudgetsCardProps) {
  return (
    <BoardCard>
      <BoardCardHeader subtitle="Ejecución actual" title="Presupuesto de proyectos" />
      <ul className={projectBudgetsCardDashboardPage.list}>
        {budgets.map((budget) => (
          <li className={projectBudgetsCardDashboardPage.item} key={budget.id}>
            <b className={projectBudgetsCardDashboardPage.name}>{budget.name}</b>
            <div className={projectBudgetsCardDashboardPage.body}>
              <div className={projectBudgetsCardDashboardPage.row}>
                <span>
                  <b className={projectBudgetsCardDashboardPage.spent}>{budget.spent}</b> de{" "}
                  {budget.total}
                </span>
                <b className={projectBudgetsCardDashboardPage.percent}>{budget.percent}%</b>
              </div>
              <ProgressBar label={`${budget.name}: ${budget.percent}%`} value={budget.percent} />
            </div>
          </li>
        ))}
      </ul>
    </BoardCard>
  );
}
