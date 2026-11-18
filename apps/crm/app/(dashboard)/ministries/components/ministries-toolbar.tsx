"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { SearchField } from "@/components/dashboard/board/search-field";
import { SegmentedToggle } from "@/components/dashboard/board/segmented-toggle";
import { cn } from "@/lib/utils";
import type { MinistryFilters, MinistryScope, MinistryViewMode } from "../types";

interface MinistriesToolbarProps {
  filters: MinistryFilters;
  onFiltersChange: (filters: MinistryFilters) => void;
  viewMode: MinistryViewMode;
  onViewModeChange: (mode: MinistryViewMode) => void;
}

const SCOPE_CHIPS: { value: MinistryScope; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "withLeader", label: "Con líder" },
  { value: "noBudget", label: "Sin presupuesto" },
];

const VIEW_OPTIONS = [
  { value: "cards", label: "Tarjetas", icon: LayoutGrid },
  { value: "table", label: "Tabla", icon: Rows3 },
] satisfies { value: MinistryViewMode; label: string; icon: typeof Rows3 }[];

const ministriesToolbarMinistriesPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  spacer: cn("hidden flex-1 lg:block"),
};

export function MinistriesToolbar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: MinistriesToolbarProps) {
  return (
    <div className={ministriesToolbarMinistriesPage.container}>
      <SearchField
        aria-label="Buscar ministerio"
        className={ministriesToolbarMinistriesPage.search}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        placeholder="Buscar ministerio…"
        value={filters.search}
      />
      {SCOPE_CHIPS.map(({ value, label }) => (
        <FilterChip
          active={filters.scope === value}
          key={value}
          onClick={() => onFiltersChange({ ...filters, scope: value })}
        >
          {label}
        </FilterChip>
      ))}
      <span aria-hidden="true" className={ministriesToolbarMinistriesPage.spacer} />
      <SegmentedToggle
        label="Vista de ministerios"
        onValueChange={onViewModeChange}
        options={VIEW_OPTIONS}
        value={viewMode}
      />
    </div>
  );
}
