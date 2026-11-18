"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";
import type { ProjectFilters, ProjectViewMode } from "../types";
import { DEFAULT_PROJECT_FILTERS, filterProjects, getProjectStats } from "../utils";
import { ProjectFiltersComponent } from "./project-filters";
import { ProjectFormModal } from "./project-form-modal";
import { ProjectTable } from "./project-table";
import { ProjectsGrid } from "./projects-grid";
import { ProjectsStats } from "./projects-stats";
import { ProjectsViewToggle } from "./projects-view-toggle";

const projectsPageContentProjectsPage = {
  page: cn("space-y-6"),
  toolbar: cn("flex items-center justify-between"),
  count: cn("text-sm text-muted-foreground"),
};

export function ProjectsPageContent() {
  const [viewMode, setViewMode] = useState<ProjectViewMode>("table");
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_PROJECT_FILTERS);

  const filteredProjects = useMemo(() => filterProjects(projects, filters), [filters]);
  const stats = useMemo(() => getProjectStats(projects), []);
  const plural = filteredProjects.length === 1 ? "" : "s";

  return (
    <div className={projectsPageContentProjectsPage.page}>
      <DashboardPageHeader
        actions={<ProjectFormModal />}
        description="Iniciativas con presupuesto propio, responsables y documentos."
        emphasis="con propósito"
        kicker="Tesorería"
        title="Proyectos"
      />

      <ProjectsStats stats={stats} />
      <ProjectFiltersComponent filters={filters} onFiltersChange={setFilters} />

      <div className={projectsPageContentProjectsPage.toolbar}>
        <p className={projectsPageContentProjectsPage.count}>
          {filteredProjects.length} proyecto{plural} encontrado{plural}
        </p>
        <ProjectsViewToggle onChange={setViewMode} value={viewMode} />
      </div>

      {viewMode === "table" ? (
        <ProjectTable projects={filteredProjects} />
      ) : (
        <ProjectsGrid projects={filteredProjects} />
      )}
    </div>
  );
}
