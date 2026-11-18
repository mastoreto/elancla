"use client";

import { format } from "date-fns";
import { DollarSign, Edit, Plus, RefreshCw } from "lucide-react";
import type { ProjectHistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const projectTimelineProjectsPage = {
  line: cn("absolute left-[19px] top-0 bottom-0 w-px bg-border"),
  oldValue: cn("px-2 py-0.5 rounded bg-muted text-muted-foreground line-through"),
  newValue: cn("px-2 py-0.5 rounded bg-accent/10 text-accent font-medium"),
};

interface ProjectTimelineProps {
  history: ProjectHistoryEntry[];
}

const actionConfig: Record<
  ProjectHistoryEntry["action"],
  { icon: typeof Plus; label: string; color: string }
> = {
  created: {
    icon: Plus,
    label: "Creado",
    color: "text-income bg-income/10",
  },
  edited: {
    icon: Edit,
    label: "Editado",
    color: "text-accent bg-accent/10",
  },
  status_changed: {
    icon: RefreshCw,
    label: "Estado Cambrado",
    color: "text-warning bg-warning-surface",
  },
  budget_updated: {
    icon: DollarSign,
    label: "Presupuesto Actualizado",
    color: "text-secondary-foreground bg-secondary",
  },
};

export function ProjectTimeline({ history }: ProjectTimelineProps) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay historial disponible</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className={projectTimelineProjectsPage.line} />

      <div className="space-y-6">
        {sortedHistory.map((entry, index) => {
          const config = actionConfig[entry.action];
          const Icon = config.icon;

          return (
            <div key={entry.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
                  config.color,
                )}
              >
                <Icon className="size-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{config.label}</span>
                  <span className="text-sm text-muted-foreground">por {entry.user}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(entry.date), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                {entry.details && (
                  <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                )}

                {entry.previousValue && entry.newValue && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className={projectTimelineProjectsPage.oldValue}>
                      {entry.previousValue}
                    </span>
                    <span className="text-muted-foreground">a</span>
                    <span className={projectTimelineProjectsPage.newValue}>
                      {entry.newValue.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
