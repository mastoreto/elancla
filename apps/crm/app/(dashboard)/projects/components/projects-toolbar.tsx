"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { SegmentedToggle } from "@/components/dashboard/board/segmented-toggle";
import { ministries } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ProjectFilters, ProjectSortKey, ProjectViewMode } from "../types";
import { PROJECT_STATUS_ORDER, PROJECT_STATUS_PILL } from "../utils";

interface ProjectsToolbarProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...PROJECT_STATUS_ORDER.map((status) => ({
    value: status,
    label: PROJECT_STATUS_PILL[status].label,
  })),
];

const MINISTRY_OPTIONS = [
  { value: "all", label: "Todos los ministerios" },
  ...ministries.map((ministry) => ({ value: ministry.name, label: ministry.name })),
];

const SORT_OPTIONS: { value: ProjectSortKey; label: string }[] = [
  { value: "date", label: "Orden: fecha" },
  { value: "name", label: "Orden: nombre" },
  { value: "budget", label: "Orden: presupuesto" },
  { value: "status", label: "Orden: estado" },
];

const VIEW_OPTIONS = [
  { value: "table", label: "Tabla", icon: Rows3 },
  { value: "grid", label: "Tarjetas", icon: LayoutGrid },
] satisfies { value: ProjectViewMode; label: string; icon: typeof Rows3 }[];

const projectsToolbarProjectsPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  spacer: cn("hidden flex-1 lg:block"),
};

export function ProjectsToolbar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: ProjectsToolbarProps) {
  return (
    <div className={projectsToolbarProjectsPage.container}>
      <SearchField
        aria-label="Buscar proyecto"
        className={projectsToolbarProjectsPage.search}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        placeholder="Buscar proyecto…"
        value={filters.search}
      />
      <FilterSelect
        label="Filtrar por estado"
        onValueChange={(status) =>
          onFiltersChange({ ...filters, status: status as ProjectFilters["status"] })
        }
        options={STATUS_OPTIONS}
        placeholder="Estado"
        value={filters.status === "all" ? "" : filters.status}
      />
      <FilterSelect
        label="Filtrar por ministerio"
        onValueChange={(ministry) => onFiltersChange({ ...filters, ministry })}
        options={MINISTRY_OPTIONS}
        placeholder="Ministerio"
        value={filters.ministry === "all" ? "" : filters.ministry}
      />
      {viewMode === "table" ? (
        <FilterSelect
          label="Ordenar proyectos"
          onValueChange={(sortBy) =>
            onFiltersChange({ ...filters, sortBy: sortBy as ProjectSortKey })
          }
          options={SORT_OPTIONS}
          value={filters.sortBy}
        />
      ) : null}
      <span aria-hidden="true" className={projectsToolbarProjectsPage.spacer} />
      <SegmentedToggle
        label="Vista de proyectos"
        onValueChange={onViewModeChange}
        options={VIEW_OPTIONS}
        value={viewMode}
      />
    </div>
  );
}
