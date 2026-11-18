import { Eye, PencilLine } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
  boardTableRaisedClass,
  boardTableRowLinkClass,
} from "@/components/dashboard/board/board-table";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { formatMoney } from "@/lib/format-money";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatProjectPeriod, getProjectProgress } from "../utils";
import { ProjectIcon } from "./project-icon";
import { ProjectStatusPill } from "./project-status-pill";

interface ProjectsTableProps {
  projects: Project[];
}

const COLUMNS = "1.8fr 130px 1.2fr 130px 150px 90px";
const HEADERS = ["Proyecto", "Presupuesto", "Ejecución", "Estado", "Periodo", ""];

const projectsTableProjectsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  name: cn("flex min-w-0 items-center gap-3"),
  icon: cn("size-[38px]"),
  nameText: cn("flex min-w-0 flex-col gap-0.5"),
  link: cn("font-bold", boardTableRowLinkClass),
  ministry: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  budget: cn("font-bold whitespace-nowrap tabular-nums"),
  execution: cn("flex w-full flex-col gap-2"),
  executionLabel: cn("text-xs text-[var(--tinta-apagada)]"),
  period: cn("text-[13.5px] text-[var(--tinta-suave)]"),
  actions: cn("flex justify-end gap-1.5", boardTableRaisedClass),
  actionIcon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <BoardCard className={projectsTableProjectsPage.card}>
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      {projects.length === 0 ? (
        <p className={projectsTableProjectsPage.empty}>No hay proyectos encontrados.</p>
      ) : (
        <BoardTableList>
          {projects.map((project) => {
            const progress = getProjectProgress(project);
            const detailHref = getChurchRoutePath("projects", project.id);
            return (
              <BoardTableRow columns={COLUMNS} key={project.id}>
                <div className={projectsTableProjectsPage.name}>
                  <ProjectIcon
                    className={projectsTableProjectsPage.icon}
                    ministries={project.ministries}
                  />
                  <div className={projectsTableProjectsPage.nameText}>
                    <Link className={projectsTableProjectsPage.link} href={detailHref}>
                      {project.name}
                    </Link>
                    <span className={projectsTableProjectsPage.ministry}>
                      {project.ministries.join(", ")}
                    </span>
                  </div>
                </div>
                <b className={projectsTableProjectsPage.budget}>
                  {formatMoney(project.budget, project.currency)}
                </b>
                <div className={projectsTableProjectsPage.execution}>
                  <ProgressBar
                    label={`${project.name}: ${progress} % ejecutado`}
                    tone={project.status === "finished" ? "gold" : "green"}
                    value={progress}
                  />
                  <span className={projectsTableProjectsPage.executionLabel}>
                    {progress} % ejecutado
                  </span>
                </div>
                <span>
                  <ProjectStatusPill status={project.status} />
                </span>
                <span className={projectsTableProjectsPage.period}>
                  {formatProjectPeriod(project.startDate, project.endDate)}
                </span>
                <div className={projectsTableProjectsPage.actions}>
                  <RowIconButton href={detailHref} label={`Ver ${project.name}`}>
                    <Eye aria-hidden="true" className={projectsTableProjectsPage.actionIcon} />
                  </RowIconButton>
                  <RowIconButton href={detailHref} label={`Editar ${project.name}`}>
                    <PencilLine
                      aria-hidden="true"
                      className={projectsTableProjectsPage.actionIcon}
                    />
                  </RowIconButton>
                </div>
              </BoardTableRow>
            );
          })}
        </BoardTableList>
      )}
    </BoardCard>
  );
}
