"use client";

import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: {
    label: "Planificación",
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  in_progress: {
    label: "En Progreso",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  finished: {
    label: "Finalizado",
    className: "bg-income/10 text-income border-income/30",
  },
  closed: {
    label: "Cerrado",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
