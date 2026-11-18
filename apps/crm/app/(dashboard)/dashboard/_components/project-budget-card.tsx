import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";
import { formatCurrency } from "./dashboard-formatters";

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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--dashboard-ink-soft)] transition hover:text-primary"
            href={getChurchRoutePath("projects")}
          >
            Abrir
            <ArrowRight className="size-3" />
          </Link>
        }
        subtitle="Presupuesto y ejecución"
        title="Proyectos activos"
      />

      <div className="space-y-4">
        {activeProjects.map((project) => {
          const progress = getProgress(project);
          const isHigh = progress >= 80;

          return (
            <article key={project.id}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">{project.name}</h3>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {project.ministries.join(", ")}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-foreground">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--dashboard-canvas-muted)]">
                <div
                  className={cn("h-full rounded-full bg-emerald-600", isHigh && "bg-primary")}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11.5px] text-muted-foreground">
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
