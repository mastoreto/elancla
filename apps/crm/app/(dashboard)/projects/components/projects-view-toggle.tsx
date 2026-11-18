"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectViewMode } from "../types";

interface ProjectsViewToggleProps {
  value: ProjectViewMode;
  onChange: (value: ProjectViewMode) => void;
}

const projectsViewToggleProjectsPage = {
  group: cn("flex rounded-lg border bg-muted/30 p-1"),
  button: cn("size-8"),
  active: cn("bg-background shadow-sm"),
};

const viewOptions = [
  { value: "table", label: "Ver como tabla", icon: List },
  { value: "grid", label: "Ver como tarjetas", icon: LayoutGrid },
] as const;

export function ProjectsViewToggle({ value, onChange }: ProjectsViewToggleProps) {
  return (
    <div className={projectsViewToggleProjectsPage.group} role="group">
      {viewOptions.map((option) => {
        const Icon = option.icon;

        return (
          <Button
            aria-label={option.label}
            aria-pressed={value === option.value}
            className={cn(
              projectsViewToggleProjectsPage.button,
              value === option.value && projectsViewToggleProjectsPage.active,
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            size="icon"
            variant="ghost"
          >
            <Icon aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}
