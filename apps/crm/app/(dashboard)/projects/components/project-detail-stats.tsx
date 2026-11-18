import { format, isSameMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { formatMoneyCompact } from "@/lib/format-money";
import type { Movement, Project } from "@/lib/types";
import { describeTimeRemaining, getProjectProgress } from "../utils";

interface ProjectDetailStatsProps {
  project: Project;
  movements: Movement[];
  today: Date;
}

export function ProjectDetailStats({ project, movements, today }: ProjectDetailStatsProps) {
  const thisMonth = movements.filter((movement) => isSameMonth(parseISO(movement.date), today));

  return (
    <StatCardGrid>
      <StatCard
        detail={`Aprobado el ${format(parseISO(project.startDate), "d MMM", { locale: es })}`}
        label="Presupuesto"
        value={formatMoneyCompact(project.budget, project.currency)}
      />
      <StatCard
        detail={`${getProjectProgress(project)} % ejecutado`}
        highlighted={true}
        label="Gastado"
        value={formatMoneyCompact(project.spent, project.currency)}
      />
      <StatCard
        detail={describeTimeRemaining(project.endDate, today) || "Sin fecha de cierre"}
        label="Disponible"
        value={formatMoneyCompact(project.budget - project.spent, project.currency)}
      />
      <StatCard
        detail={`${thisMonth.length} este mes`}
        label="Movimientos"
        value={String(movements.length)}
      />
    </StatCardGrid>
  );
}
