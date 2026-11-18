"use client";

import { Check, ChevronDown, PencilLine, RefreshCw } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_ORDER, PROJECT_STATUS_PILL } from "../utils";
import { ProjectFormModal } from "./project-form-modal";
import { ProjectIcon } from "./project-icon";
import { ProjectStatusPill } from "./project-status-pill";

interface ProjectDetailHeroProps {
  project: Project;
  status: ProjectStatus;
  canEdit: boolean;
  onStatusChange: (status: ProjectStatus) => void;
}

const projectDetailHeroProjectsPage = {
  card: cn(
    "flex flex-wrap items-center gap-[26px] rounded-[30px] p-[26px]",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)] bg-secondary",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_10px_30px_-18px_rgba(60,20,30,0.28)]",
  ),
  icon: cn("size-16"),
  iconGlyph: cn("size-7"),
  body: cn("flex min-w-60 flex-1 flex-col gap-2"),
  titleRow: cn("flex flex-wrap items-center gap-2.5"),
  title: cn("font-display text-[32px] leading-tight font-semibold tracking-tight"),
  description: cn("max-w-[560px] text-sm leading-[1.55] text-[var(--tinta-suave)]"),
  actions: cn("flex gap-2.5"),
  icon16: cn("size-4"),
  check: cn("ml-auto size-4"),
  menuItem: cn("min-w-48 gap-2"),
};

export function ProjectDetailHero({
  project,
  status,
  canEdit,
  onStatusChange,
}: ProjectDetailHeroProps) {
  return (
    <section className={projectDetailHeroProjectsPage.card}>
      <ProjectIcon
        className={projectDetailHeroProjectsPage.icon}
        iconClassName={projectDetailHeroProjectsPage.iconGlyph}
        ministries={project.ministries}
      />
      <div className={projectDetailHeroProjectsPage.body}>
        <div className={projectDetailHeroProjectsPage.titleRow}>
          <h1 className={projectDetailHeroProjectsPage.title}>{project.name}</h1>
          <ProjectStatusPill status={status} />
        </div>
        {project.description ? (
          <p className={projectDetailHeroProjectsPage.description}>{project.description}</p>
        ) : null}
      </div>

      {canEdit ? (
        <div className={projectDetailHeroProjectsPage.actions}>
          <ProjectFormModal
            project={project}
            trigger={
              <BoardButton variant="outline">
                <PencilLine aria-hidden="true" className={projectDetailHeroProjectsPage.icon16} />
                Editar
              </BoardButton>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <BoardButton variant="dark">
                <RefreshCw aria-hidden="true" className={projectDetailHeroProjectsPage.icon16} />
                Cambiar estado
                <ChevronDown aria-hidden="true" className={projectDetailHeroProjectsPage.icon16} />
              </BoardButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PROJECT_STATUS_ORDER.map((option) => (
                <DropdownMenuItem
                  className={projectDetailHeroProjectsPage.menuItem}
                  key={option}
                  onSelect={() => onStatusChange(option)}
                >
                  {PROJECT_STATUS_PILL[option].label}
                  {option === status ? (
                    <Check aria-hidden="true" className={projectDetailHeroProjectsPage.check} />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </section>
  );
}
