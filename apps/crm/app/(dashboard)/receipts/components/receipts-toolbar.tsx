"use client";

import type { DateRange } from "react-day-picker";
import { DateRangePill } from "@/components/dashboard/board/date-range-pill";
import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { cn } from "@/lib/utils";

interface ReceiptsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const CURRENCY_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "UYU", label: "UYU · $U" },
  { value: "USD", label: "USD · US$" },
];

const receiptsToolbarReceiptsPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
};

export function ReceiptsToolbar({
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  dateRange,
  onDateRangeChange,
}: ReceiptsToolbarProps) {
  return (
    <div className={receiptsToolbarReceiptsPage.container}>
      <SearchField
        aria-label="Buscar por número o proveedor"
        className={receiptsToolbarReceiptsPage.search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por número o proveedor…"
        value={searchQuery}
      />
      <FilterSelect
        label="Filtrar por moneda"
        onValueChange={onCurrencyChange}
        options={CURRENCY_OPTIONS}
        placeholder="Moneda"
        value={currency === "all" ? "" : currency}
      />
      <DateRangePill onChange={onDateRangeChange} value={dateRange} />
    </div>
  );
}
