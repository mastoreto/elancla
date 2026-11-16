"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { type ProjectFilters, ProjectFiltersComponent } from "@/components/project-filters";
import { ProjectFormModal } from "@/components/project-form-modal";
import { ProjectTable } from "@/components/project-table";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    status: "all",
    ministry: "all",
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: "date",
    sortOrder: "desc",
  });

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }

    // Ministry filter
    if (filters.ministry !== "all") {
      result = result.filter((p) => p.ministries.includes(filters.ministry));
    }

    // Date filters
    if (filters.dateFrom) {
      result = result.filter((p) => new Date(p.startDate) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((p) => new Date(p.startDate) <= filters.dateTo!);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "budget":
          comparison = a.budget - b.budget;
          break;
        case "status": {
          const statusOrder = { planning: 0, in_progress: 1, finished: 2, closed: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case "date":
        default:
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [filters]);

  // Stats
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "in_progress").length;
    const planning = projects.filter((p) => p.status === "planning").length;
    const totalBudgetUyu = projects
      .filter((p) => p.currency === "UYU")
      .reduce((sum, p) => sum + p.budget, 0);
    const totalBudgetUsd = projects
      .filter((p) => p.currency === "USD")
      .reduce((sum, p) => sum + p.budget, 0);

    return { active, planning, totalBudgetUYU: totalBudgetUyu, totalBudgetUSD: totalBudgetUsd };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona y realiza seguimiento a todos los proyectos de la iglesia y sus presupuestos
          </p>
        </div>
        <ProjectFormModal />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Proyectos Activos</p>
          <p className="text-2xl font-bold text-accent">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">En Planificación</p>
          <p className="text-2xl font-bold text-blue-600">{stats.planning}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Presupuesto Total (UYU)</p>
          <p className="text-2xl font-bold">${stats.totalBudgetUYU.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Presupuesto Total (USD)</p>
          <p className="text-2xl font-bold">${stats.totalBudgetUSD.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <ProjectFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} proyecto{filteredProjects.length === 1 ? "" : "s"} encontrado
          {filteredProjects.length === 1 ? "" : "s"}
        </p>
        <div className="flex rounded-lg border bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === "table" ? "bg-background shadow-sm" : ""}
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={viewMode === "grid" ? "bg-background shadow-sm" : ""}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {/* Project List */}
      {viewMode === "table" ? (
        <ProjectTable projects={filteredProjects} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border/50 bg-card p-12 flex flex-col items-center justify-center text-center">
              <h3 className="font-semibold text-foreground mb-1">No hay proyectos encontrados</h3>
              <p className="text-sm text-muted-foreground">
                Intenta ajustando tus filtros o crea un nuevo proyecto
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
