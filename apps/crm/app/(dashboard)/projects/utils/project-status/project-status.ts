import type { StatusPillTone } from "@/components/dashboard/board/status-pill";
import type { ProjectStatus } from "@/lib/types";

export const PROJECT_STATUS_PILL: Record<ProjectStatus, { tone: StatusPillTone; label: string }> = {
  planning: { tone: "ink", label: "Planificación" },
  in_progress: { tone: "gold", label: "En curso" },
  finished: { tone: "green", label: "Finalizado" },
  closed: { tone: "ink", label: "Cerrado" },
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "planning",
  "in_progress",
  "finished",
  "closed",
];

/** Spent over budget as a whole percentage (0 when there is no budget). */
export function getProjectProgress(project: { budget: number; spent: number }): number {
  return project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;
}
