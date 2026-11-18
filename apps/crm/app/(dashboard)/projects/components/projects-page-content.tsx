"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ProjectFilters, ProjectViewMode } from "../types";
import { DEFAULT_PROJECT_FILTERS, filterProjects } from "../utils";
import { ProjectFormModal } from "./project-form-modal";
import { ProjectsCards } from "./projects-cards";
import { ProjectsTable } from "./projects-table";
import { ProjectsToolbar } from "./projects-toolbar";

const DESCRIPTIONS: Record<ProjectViewMode, string> = {
  table: "Iniciativas con presupuesto propio, responsables y documentos.",
  grid: "Vista de tarjetas: ideal para ver el avance de un vistazo.",
};

const projectsPageContentProjectsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
};

export function ProjectsPageContent() {
  const [viewMode, setViewMode] = useState<ProjectViewMode>("table");
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_PROJECT_FILTERS);

  const filteredProjects = useMemo(() => filterProjects(projects, filters), [filters]);

  return (
    <div className={projectsPageContentProjectsPage.page}>
      <div className={projectsPageContentProjectsPage.header}>
        <p className={projectsPageContentProjectsPage.description}>{DESCRIPTIONS[viewMode]}</p>
        <ProjectFormModal />
      </div>

      <ProjectsToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {viewMode === "table" ? (
        <ProjectsTable projects={filteredProjects} />
      ) : (
        <ProjectsCards projects={filteredProjects} />
      )}
    </div>
  );
}
