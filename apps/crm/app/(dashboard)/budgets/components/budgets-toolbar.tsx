"use client";

import { FilterSelect } from "@/components/dashboard/board/filter-select";
import { SearchField } from "@/components/dashboard/board/search-field";
import { cn } from "@/lib/utils";

interface BudgetsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  ministry: string;
  ministries: string[];
  onMinistryChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
}

const CURRENCY_OPTIONS = [
  { value: "all", label: "Todas las monedas" },
  { value: "UYU", label: "UYU · $U" },
  { value: "USD", label: "USD · US$" },
];

const budgetsToolbarBudgetsPage = {
  container: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
};

export function BudgetsToolbar({
  searchQuery,
  onSearchChange,
  ministry,
  ministries,
  onMinistryChange,
  currency,
  onCurrencyChange,
}: BudgetsToolbarProps) {
  const ministryOptions = [
    { value: "all", label: "Todos los ministerios" },
    ...ministries.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className={budgetsToolbarBudgetsPage.container}>
      <SearchField
        aria-label="Buscar presupuesto"
        className={budgetsToolbarBudgetsPage.search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar presupuesto…"
        value={searchQuery}
      />
      <FilterSelect
        label="Filtrar por ministerio"
        onValueChange={onMinistryChange}
        options={ministryOptions}
        placeholder="Ministerio"
        value={ministry === "all" ? "" : ministry}
      />
      <FilterSelect
        label="Filtrar por moneda"
        onValueChange={onCurrencyChange}
        options={CURRENCY_OPTIONS}
        placeholder="Moneda"
        value={currency === "all" ? "" : currency}
      />
    </div>
  );
}
