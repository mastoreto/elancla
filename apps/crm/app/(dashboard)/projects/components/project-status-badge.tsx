"use client";

import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: {
    label: "Planificación",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  in_progress: {
    label: "En Progreso",
    className: "bg-warning-surface text-warning border-oro",
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
