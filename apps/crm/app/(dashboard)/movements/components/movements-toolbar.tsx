"use client";

import { X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DateRangePill } from "@/components/dashboard/board/date-range-pill";
import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { cn } from "@/lib/utils";

interface MovementsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClear: () => void;
}

const CURRENCY_OPTIONS = [
  { value: "all", label: "Todas las monedas" },
  { value: "UYU", label: "UYU · $U" },
  { value: "USD", label: "USD · US$" },
];

const movementsToolbarMovementsPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  clear: cn(
    "inline-flex h-[34px] items-center gap-[7px] rounded-full bg-card px-3.5 text-[13px] font-semibold text-[var(--tinta-suave)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition hover:bg-secondary",
  ),
  clearIcon: cn("size-3.5"),
};

export function MovementsToolbar({
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  dateRange,
  onDateRangeChange,
  onClear,
}: MovementsToolbarProps) {
  return (
    <div className={movementsToolbarMovementsPage.container}>
      <SearchField
        aria-label="Buscar concepto o proyecto"
        className={movementsToolbarMovementsPage.search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar concepto o proyecto…"
        value={searchQuery}
      />
      <FilterSelect
        label="Filtrar por moneda"
        onValueChange={onCurrencyChange}
        options={CURRENCY_OPTIONS}
        value={currency}
      />
      <DateRangePill onChange={onDateRangeChange} value={dateRange} />
      <button className={movementsToolbarMovementsPage.clear} onClick={onClear} type="button">
        <X aria-hidden="true" className={movementsToolbarMovementsPage.clearIcon} />
        Limpiar
      </button>
    </div>
  );
}
