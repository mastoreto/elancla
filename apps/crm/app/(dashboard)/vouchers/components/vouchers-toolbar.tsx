"use client";

import type { DateRange } from "react-day-picker";
import { DateRangePill } from "@/components/dashboard/board/date-range-pill";
import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { cn } from "@/lib/utils";

interface VouchersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  responsible: string;
  responsibles: string[];
  onResponsibleChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const vouchersToolbarVouchersPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
};

export function VouchersToolbar({
  searchQuery,
  onSearchChange,
  responsible,
  responsibles,
  onResponsibleChange,
  dateRange,
  onDateRangeChange,
}: VouchersToolbarProps) {
  const options = [
    { value: "all", label: "Todos" },
    ...responsibles.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className={vouchersToolbarVouchersPage.container}>
      <SearchField
        aria-label="Buscar comprobante o responsable"
        className={vouchersToolbarVouchersPage.search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar comprobante o responsable…"
        value={searchQuery}
      />
      <FilterSelect
        label="Filtrar por responsable"
        onValueChange={onResponsibleChange}
        options={options}
        placeholder="Responsable"
        value={responsible === "all" ? "" : responsible}
      />
      <DateRangePill onChange={onDateRangeChange} value={dateRange} />
    </div>
  );
}
