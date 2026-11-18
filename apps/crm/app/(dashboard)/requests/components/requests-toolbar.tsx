"use client";

import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { ministries } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { RequestStatusFilter } from "../utils";

interface RequestsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  status: RequestStatusFilter;
  onStatusChange: (value: RequestStatusFilter) => void;
  counts: Record<RequestStatusFilter, number>;
  ministry: string;
  onMinistryChange: (value: string) => void;
}

const STATUS_TABS: { value: RequestStatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

const MINISTRY_OPTIONS = [
  { value: "all", label: "Todos los ministerios" },
  ...ministries.map((item) => ({ value: item.name, label: item.name })),
];

const requestsToolbarRequestsPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  spacer: cn("hidden flex-1 lg:block"),
};

export function RequestsToolbar({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  counts,
  ministry,
  onMinistryChange,
}: RequestsToolbarProps) {
  return (
    <div className={requestsToolbarRequestsPage.container}>
      <SearchField
        aria-label="Buscar solicitud, ministerio o líder"
        className={requestsToolbarRequestsPage.search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar solicitud, ministerio o líder…"
        value={searchQuery}
      />

      {STATUS_TABS.map((tab) => (
        <FilterChip
          active={status === tab.value}
          count={tab.value === "all" ? undefined : counts[tab.value]}
          key={tab.value}
          onClick={() => onStatusChange(tab.value)}
        >
          {tab.label}
        </FilterChip>
      ))}

      <span aria-hidden="true" className={requestsToolbarRequestsPage.spacer} />

      <FilterSelect
        label="Filtrar por ministerio"
        onValueChange={onMinistryChange}
        options={MINISTRY_OPTIONS}
        placeholder="Ministerio"
        value={ministry === "all" ? "" : ministry}
      />
    </div>
  );
}
