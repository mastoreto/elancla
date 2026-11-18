import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";
import { formatCurrency } from "./dashboard-formatters";

const projectBudgetCardDashboardPage = {
  link: cn("inline-flex items-center gap-1.5 text-xs font-semibold text-tinta-suave transition hover:text-primary"),
  linkIcon: cn("size-3"),
  list: cn("space-y-4"),
  row: cn("mb-2 flex items-start justify-between gap-3"),
  body: cn("min-w-0"),
  name: cn("truncate text-sm font-semibold text-foreground"),
  ministries: cn("mt-0.5 text-[11.5px] text-muted-foreground"),
  percent: cn("font-mono text-xs font-semibold text-foreground"),
  track: cn("h-2 rounded-full bg-bruma"),
  footer: cn("mt-2 flex justify-between text-[11.5px] text-muted-foreground"),
};

const projectBudgetBarDashboardPage = {
  base: "h-full rounded-full",
  normal: "bg-income",
  high: "bg-primary",
} as const;

type ProjectBudgetCardProps = {
  projects: Project[];
};

function getProgress(project: Project) {
  return project.budget > 0 ? Math.min(Math.round((project.spent / project.budget) * 100), 100) : 0;
}

export function ProjectBudgetCard({ projects }: ProjectBudgetCardProps) {
  const activeProjects = projects
    .filter((project) => project.status === "in_progress" || project.status === "planning")
    .slice(0, 4);

  return (
    <DashboardCard>
      <DashboardCardHeader
        action={
          <Link
            className={projectBudgetCardDashboardPage.link}
            href={getChurchRoutePath("projects")}
          >
            Abrir
            <ArrowRight className={projectBudgetCardDashboardPage.linkIcon} />
          </Link>
        }
        subtitle="Presupuesto y ejecución"
        title="Proyectos activos"
      />

      <div className={projectBudgetCardDashboardPage.list}>
        {activeProjects.map((project) => {
          const progress = getProgress(project);
          const isHigh = progress >= 80;

          return (
            <article key={project.id}>
              <div className={projectBudgetCardDashboardPage.row}>
                <div className={projectBudgetCardDashboardPage.body}>
                  <h3 className={projectBudgetCardDashboardPage.name}>{project.name}</h3>
                  <p className={projectBudgetCardDashboardPage.ministries}>
                    {project.ministries.join(", ")}
                  </p>
                </div>
                <span className={projectBudgetCardDashboardPage.percent}>{progress}%</span>
              </div>
              <div className={projectBudgetCardDashboardPage.track}>
                <div
                  className={cn(
                    projectBudgetBarDashboardPage.base,
                    isHigh ? projectBudgetBarDashboardPage.high : projectBudgetBarDashboardPage.normal,
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={projectBudgetCardDashboardPage.footer}>
                <span>{formatCurrency(project.spent, project.currency)} usado</span>
                <span>{formatCurrency(project.budget, project.currency)} total</span>
              </div>
            </article>
          );
        })}
      </div>
    </DashboardCard>
  );
}
