"use client";

import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardSelect } from "@/components/dashboard/board/board-form";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { cn } from "@/lib/utils";
import type { CopyFilters as CopyFiltersValue, KindFilter, MinistryOption } from "../../types";

const copyFiltersCopyPage = {
  container: cn("flex flex-wrap items-end gap-3"),
  kinds: cn("flex flex-wrap gap-2 pb-1"),
  ministry: cn("w-60"),
  spacer: cn("flex-1"),
};

const KIND_CHIPS = [
  { value: "all", label: "Todo" },
  { value: "activity", label: "Actividades" },
  { value: "event", label: "Eventos" },
] satisfies { value: KindFilter; label: string }[];

/** A select cannot hold an empty value, so "every ministry" travels as this one. */
const ALL_MINISTRIES = "all";

interface CopyFiltersProps {
  filters: CopyFiltersValue;
  ministries: readonly MinistryOption[];
  /** How many items the filters let through. */
  filteredCount: number;
  allSelected: boolean;
  disabled: boolean;
  onChange: (filters: CopyFiltersValue) => void;
  onToggleAll: () => void;
}

/** Filters of the wizard by kind and ministry, and "select everything that is filtered". */
export function CopyFilters({
  filters,
  ministries,
  filteredCount,
  allSelected,
  disabled,
  onChange,
  onToggleAll,
}: CopyFiltersProps) {
  const ministryOptions = [
    { value: ALL_MINISTRIES, label: "Todos los ministerios" },
    ...ministries.map((ministry) => ({ value: ministry.id, label: ministry.name })),
  ];
  return (
    <div className={copyFiltersCopyPage.container}>
      <div className={copyFiltersCopyPage.kinds}>
        {KIND_CHIPS.map((chip) => (
          <FilterChip
            active={filters.kind === chip.value}
            key={chip.value}
            onClick={() => onChange({ ...filters, kind: chip.value })}
          >
            {chip.label}
          </FilterChip>
        ))}
      </div>
      <div className={copyFiltersCopyPage.ministry}>
        <BoardSelect
          id="copy-ministry-filter"
          label="Ministerio"
          onValueChange={(value) =>
            onChange({ ...filters, ministryId: value === ALL_MINISTRIES ? "" : value })
          }
          options={ministryOptions}
          value={filters.ministryId === "" ? ALL_MINISTRIES : filters.ministryId}
        />
      </div>
      <span className={copyFiltersCopyPage.spacer} />
      <BoardButton
        data-testid="copy-toggle-all"
        disabled={disabled || filteredCount === 0}
        onClick={onToggleAll}
        variant="outline"
      >
        {allSelected ? "Quitar lo filtrado" : "Seleccionar todo lo filtrado"}
      </BoardButton>
    </div>
  );
}
