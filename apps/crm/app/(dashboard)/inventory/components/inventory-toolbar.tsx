"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { SearchField } from "@/components/dashboard/board/search-field";
import { SegmentedToggle } from "@/components/dashboard/board/segmented-toggle";
import { cn } from "@/lib/utils";
import type { InventoryCategoryFilter, InventoryFilters, InventoryViewMode } from "../types";
import { INVENTORY_CATEGORIES } from "../utils";

interface InventoryToolbarProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  viewMode: InventoryViewMode;
  onViewModeChange: (mode: InventoryViewMode) => void;
}

const CATEGORY_CHIPS: { value: InventoryCategoryFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  ...INVENTORY_CATEGORIES.filter((category) => category !== "Cocina").map((category) => ({
    value: category,
    label: category,
  })),
];

const VIEW_OPTIONS = [
  { value: "table", label: "Tabla", icon: Rows3 },
  { value: "grid", label: "Tarjetas", icon: LayoutGrid },
] satisfies { value: InventoryViewMode; label: string; icon: typeof Rows3 }[];

const inventoryToolbarInventoryPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  spacer: cn("hidden flex-1 lg:block"),
};

export function InventoryToolbar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: InventoryToolbarProps) {
  return (
    <div className={inventoryToolbarInventoryPage.container}>
      <SearchField
        aria-label="Buscar ítem o código"
        className={inventoryToolbarInventoryPage.search}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        placeholder="Buscar ítem o código…"
        value={filters.search}
      />
      {CATEGORY_CHIPS.map(({ value, label }) => (
        <FilterChip
          active={filters.category === value}
          key={value}
          onClick={() => onFiltersChange({ ...filters, category: value })}
        >
          {label}
        </FilterChip>
      ))}
      <span aria-hidden="true" className={inventoryToolbarInventoryPage.spacer} />
      <SegmentedToggle
        label="Vista de inventario"
        onValueChange={onViewModeChange}
        options={VIEW_OPTIONS}
        value={viewMode}
      />
    </div>
  );
}
