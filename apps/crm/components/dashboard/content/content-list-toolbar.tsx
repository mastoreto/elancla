"use client";

import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { FilterSelect, type FilterSelectOption } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { cn } from "@/lib/utils";
import type { ContentFilters, ContentStatusFilter } from "./content-list-utils";

const STATUS_CHIPS: { value: ContentStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
];

const ALL_GROUPS = "__all__";

const contentListToolbarDashboardPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
};

interface ContentListToolbarProps {
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
  searchLabel: string;
  searchPlaceholder: string;
  /** Label of the series/category select, e.g. "Serie". */
  groupLabel: string;
  groups: readonly string[];
}

/** Search, status chips and a series/category select shared by the content lists. */
export function ContentListToolbar({
  filters,
  onFiltersChange,
  searchLabel,
  searchPlaceholder,
  groupLabel,
  groups,
}: ContentListToolbarProps) {
  const options: FilterSelectOption[] = [
    { value: ALL_GROUPS, label: `${groupLabel}: todas` },
    ...groups.map((group) => ({ value: group, label: group })),
  ];

  return (
    <div className={contentListToolbarDashboardPage.container}>
      <SearchField
        aria-label={searchLabel}
        className={contentListToolbarDashboardPage.search}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        placeholder={searchPlaceholder}
        value={filters.search}
      />
      {STATUS_CHIPS.map(({ value, label }) => (
        <FilterChip
          active={filters.status === value}
          key={value}
          onClick={() => onFiltersChange({ ...filters, status: value })}
        >
          {label}
        </FilterChip>
      ))}
      <FilterSelect
        label={groupLabel}
        onValueChange={(group) =>
          onFiltersChange({ ...filters, group: group === ALL_GROUPS ? "" : group })
        }
        options={options}
        placeholder={groupLabel}
        value={filters.group || ALL_GROUPS}
      />
    </div>
  );
}
