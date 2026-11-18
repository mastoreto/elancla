"use client";

import { format } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const movementsFiltersMovementsPage = {
  container: cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"),
  controls: cn("flex flex-1 items-center gap-2"),
  search: cn("relative max-w-sm flex-1"),
  searchIcon: cn("absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"),
  searchInput: cn("pl-9"),
  filterButton: cn("gap-2"),
  filterButtonIcon: cn("size-4"),
  filterButtonLabel: cn("hidden sm:inline"),
  countBadge: cn("size-5 justify-center p-0"),
  popover: cn("w-80"),
  popoverBody: cn("space-y-4"),
  popoverTitle: cn("font-medium"),
  dateTrigger: cn("w-full justify-start text-left font-normal"),
  dateTriggerEmpty: cn("text-muted-foreground"),
  calendarPopover: cn("w-auto p-0"),
  clearButton: cn("w-full"),
  clearIcon: cn("mr-2 size-4"),
  activeFilters: cn("flex items-center gap-2"),
  activeBadge: cn("gap-1"),
  removeButton: cn("ml-1 hover:text-foreground"),
  removeIcon: cn("size-3"),
};

interface MovementsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function MovementsFilters({
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}: MovementsFiltersProps) {
  return (
    <div className={movementsFiltersMovementsPage.container}>
      <div className={movementsFiltersMovementsPage.controls}>
        {/* Search Input */}
        <div className={movementsFiltersMovementsPage.search}>
          <Search className={movementsFiltersMovementsPage.searchIcon} />
          <Input
            placeholder="Buscar movimientos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={movementsFiltersMovementsPage.searchInput}
          />
        </div>

        {/* Filters Popover */}
        <Popover>
          <PopoverTrigger asChild={true}>
            <Button variant="outline" className={movementsFiltersMovementsPage.filterButton}>
              <SlidersHorizontal className={movementsFiltersMovementsPage.filterButtonIcon} />
              <span className={movementsFiltersMovementsPage.filterButtonLabel}>Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className={movementsFiltersMovementsPage.countBadge}>
                  {(currency === "all" ? 0 : 1) + (dateRange ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={movementsFiltersMovementsPage.popover} align="start">
            <div className={movementsFiltersMovementsPage.popoverBody}>
              <div className={movementsFiltersMovementsPage.popoverTitle}>Filtros</div>

              <Field>
                <FieldLabel>Moneda</FieldLabel>
                <Select value={currency} onValueChange={onCurrencyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las monedas</SelectItem>
                    <SelectItem value="UYU">UYU - Peso Uruguayo</SelectItem>
                    <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Rango de Fechas</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild={true}>
                    <Button
                      variant="outline"
                      className={cn(
                        movementsFiltersMovementsPage.dateTrigger,
                        !dateRange && movementsFiltersMovementsPage.dateTriggerEmpty,
                      )}
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Selecciona un rango de fechas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={movementsFiltersMovementsPage.calendarPopover}
                    align="start"
                  >
                    <Calendar
                      autoFocus={true}
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={onDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className={movementsFiltersMovementsPage.clearButton}
                >
                  <X className={movementsFiltersMovementsPage.clearIcon} />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className={movementsFiltersMovementsPage.activeFilters}>
          {currency !== "all" && (
            <Badge variant="secondary" className={movementsFiltersMovementsPage.activeBadge}>
              {currency}
              <button
                type="button"
                onClick={() => onCurrencyChange("all")}
                className={movementsFiltersMovementsPage.removeButton}
              >
                <X className={movementsFiltersMovementsPage.removeIcon} />
              </button>
            </Badge>
          )}
          {dateRange && (
            <Badge variant="secondary" className={movementsFiltersMovementsPage.activeBadge}>
              {format(dateRange.from!, "MMM d")}
              {dateRange.to && ` - ${format(dateRange.to, "MMM d")}`}
              <button
                type="button"
                onClick={() => onDateRangeChange(undefined)}
                className={movementsFiltersMovementsPage.removeButton}
              >
                <X className={movementsFiltersMovementsPage.removeIcon} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
