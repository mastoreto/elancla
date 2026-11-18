import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { getChurchRoutePath } from "@/lib/church";
import { formatMoney } from "@/lib/format-money";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatProjectPeriod, getProjectProgress } from "../utils";
import { ProjectIcon } from "./project-icon";
import { ProjectStatusPill } from "./project-status-pill";

interface ProjectsCardsProps {
  projects: Project[];
}

const projectsCardsProjectsPage = {
  grid: cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"),
  card: cn("p-[22px]"),
  header: cn("flex items-start gap-3"),
  icon: cn("size-11"),
  heading: cn("flex flex-1 flex-col gap-[3px]"),
  title: cn("font-display text-xl leading-tight font-medium"),
  meta: cn("text-[13px] text-[var(--tinta-apagada)]"),
  status: cn("my-3.5"),
  progress: cn("flex w-full flex-col gap-2"),
  amounts: cn("flex justify-between text-[13px] text-[var(--tinta-apagada)] tabular-nums"),
  spent: cn("text-foreground"),
  percent: cn("font-bold text-[var(--vida)]"),
  percentDone: cn("text-[var(--oro-texto)]"),
  track: cn("h-2.5"),
  footer: cn("mt-4 flex gap-2"),
  link: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-(--granada-50) px-4 text-[13px] font-bold text-primary",
    "transition hover:-translate-y-px motion-reduce:transition-none",
  ),
  linkIcon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function ProjectsCards({ projects }: ProjectsCardsProps) {
  if (projects.length === 0) {
    return <p className={projectsCardsProjectsPage.empty}>No hay proyectos encontrados.</p>;
  }

  return (
    <div className={projectsCardsProjectsPage.grid}>
      {projects.map((project) => {
        const progress = getProjectProgress(project);
        const isDone = progress >= 100;
        return (
          <BoardCard className={projectsCardsProjectsPage.card} key={project.id}>
            <div className={projectsCardsProjectsPage.header}>
              <ProjectIcon
                className={projectsCardsProjectsPage.icon}
                ministries={project.ministries}
              />
              <div className={projectsCardsProjectsPage.heading}>
                <b className={projectsCardsProjectsPage.title}>{project.name}</b>
                <span className={projectsCardsProjectsPage.meta}>
                  {project.ministries.join(", ")} ·{" "}
                  {formatProjectPeriod(project.startDate, project.endDate)}
                </span>
              </div>
            </div>
            <div className={projectsCardsProjectsPage.status}>
              <ProjectStatusPill status={project.status} />
            </div>
            <div className={projectsCardsProjectsPage.progress}>
              <div className={projectsCardsProjectsPage.amounts}>
                <span>
                  <b className={projectsCardsProjectsPage.spent}>
                    {formatMoney(project.spent, project.currency)}
                  </b>{" "}
                  de {formatMoney(project.budget, project.currency)}
                </span>
                <b
                  className={cn(
                    projectsCardsProjectsPage.percent,
                    isDone && projectsCardsProjectsPage.percentDone,
                  )}
                >
                  {progress}%
                </b>
              </div>
              <ProgressBar
                className={projectsCardsProjectsPage.track}
                label={`${project.name}: ${progress} % ejecutado`}
                tone={isDone ? "gold" : "green"}
                value={progress}
              />
            </div>
            <div className={projectsCardsProjectsPage.footer}>
              <Link
                className={projectsCardsProjectsPage.link}
                href={getChurchRoutePath("projects", project.id)}
              >
                <ArrowUpRight aria-hidden="true" className={projectsCardsProjectsPage.linkIcon} />
                Ver proyecto
              </Link>
            </div>
          </BoardCard>
        );
      })}
    </div>
  );
}
