"use client";

import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, parseLocalDate } from "@/lib/utils";

// ─── Public contracts ────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  label: string;
  /** Custom cell renderer. Falls back to String(row[key]) when omitted. */
  render?: (row: T) => ReactNode;
  className?: string;
}

interface BaseFilter<T> {
  key: string;
  label: string;
  placeholder?: string;
  /** Extracts the filterable string value from a row. */
  getValue: (row: T) => string;
}

interface TextFilter<T> extends BaseFilter<T> {
  type: "text";
}

interface SelectFilter<T> extends BaseFilter<T> {
  type: "select";
  options: { value: string; label: string }[];
}

interface DateRangeFilter<T> extends BaseFilter<T> {
  type: "daterange";
}

export type FilterConfig<T> = TextFilter<T> | SelectFilter<T> | DateRangeFilter<T>;

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: FilterConfig<T>[];
  /** Rows per page. Defaults to 10. */
  pageSize?: number;
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

// ─── Type guards ─────────────────────────────────────────────────────────────

const DataTableSharedPage = {
  removeChip: cn("ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"),
  block: cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"),
  search: cn(
    "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none",
  ),
  action: cn("text-muted-foreground hover:text-foreground self-start sm:self-auto shrink-0"),
  blockFlex: cn(
    "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 pt-3 border-t border-border",
  ),
  label: cn("flex size-8 items-center justify-center text-muted-foreground text-sm"),
  blockText: cn("flex flex-col items-center justify-center py-16 text-center"),
  blockRounded: cn("size-12 rounded-full bg-muted flex items-center justify-center mb-4"),
  blockBorder: cn("rounded-lg border border-border bg-card overflow-hidden"),
};

function isTextFilter<T>(f: FilterConfig<T>): f is TextFilter<T> {
  return f.type === "text";
}

function isSelectFilter<T>(f: FilterConfig<T>): f is SelectFilter<T> {
  return f.type === "select";
}

function isDateRangeFilter<T>(f: FilterConfig<T>): f is DateRangeFilter<T> {
  return f.type === "daterange";
}

// ─── Internal state ──────────────────────────────────────────────────────────

interface FilterState {
  text: string;
  selects: Record<string, string>;
  dateranges: Record<string, DateRange | undefined>;
}

function buildInitialState<T>(filters: FilterConfig<T>[]): FilterState {
  return {
    text: "",
    selects: Object.fromEntries(filters.filter(isSelectFilter).map((f) => [f.key, "all"])),
    dateranges: Object.fromEntries(
      filters.filter(isDateRangeFilter).map((f) => [f.key, undefined]),
    ),
  };
}

// ─── FiltersBar ───────────────────────────────────────────────────────────────

interface FiltersBarProps<T> {
  filters: FilterConfig<T>[];
  state: FilterState;
  onTextChange: (value: string) => void;
  onSelectChange: (key: string, value: string) => void;
  onDateRangeChange: (key: string, range: DateRange | undefined) => void;
  onClearAll: () => void;
}

// Memoized to prevent re-renders when only currentPage changes in the parent.
const FiltersBar = memo(function FiltersBar<T>({
  filters,
  state,
  onTextChange,
  onSelectChange,
  onDateRangeChange,
  onClearAll,
}: FiltersBarProps<T>) {
  const textFilter = filters.find(isTextFilter);
  const advancedFilters = filters.filter((f) => !isTextFilter(f));

  const activeSelectCount = Object.values(state.selects).filter((v) => v !== "all").length;
  const activeDateCount = Object.values(state.dateranges).filter(Boolean).length;
  const activeAdvancedCount = activeSelectCount + activeDateCount;
  const hasActive = state.text !== "" || activeAdvancedCount > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className={DataTableSharedPage.block}>
        <div className="flex flex-1 items-center gap-2">
          {textFilter && (
            <div className="relative flex-1 max-w-sm">
              <Search className={DataTableSharedPage.search} />
              <Input
                placeholder={textFilter.placeholder ?? "Buscar..."}
                value={state.text}
                onChange={(e) => onTextChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {advancedFilters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild={true}>
                <Button variant="outline" className="gap-2 shrink-0">
                  <SlidersHorizontal className="size-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeAdvancedCount > 0 && (
                    <Badge variant="secondary" className="size-5 p-0 justify-center text-[10px]">
                      {activeAdvancedCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <p className="font-semibold text-sm">Filtros</p>

                  {advancedFilters.map((filter) => {
                    if (isSelectFilter(filter)) {
                      return (
                        <Field key={filter.key}>
                          <FieldLabel>{filter.label}</FieldLabel>
                          <Select
                            value={state.selects[filter.key]}
                            onValueChange={(v) => onSelectChange(filter.key, v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={filter.placeholder ?? "Todos"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{filter.placeholder ?? "Todos"}</SelectItem>
                              {filter.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      );
                    }

                    if (isDateRangeFilter(filter)) {
                      const range = state.dateranges[filter.key];
                      return (
                        <Field key={filter.key}>
                          <FieldLabel>{filter.label}</FieldLabel>
                          <Popover>
                            <PopoverTrigger asChild={true}>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-white dark:bg-input/30",
                                  !range && "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 size-4 shrink-0" />
                                {range?.from ? (
                                  range.to ? (
                                    <>
                                      {format(range.from, "dd/MM/yy")} –{" "}
                                      {format(range.to, "dd/MM/yy")}
                                    </>
                                  ) : (
                                    format(range.from, "dd/MM/yy")
                                  )
                                ) : (
                                  <span>Seleccionar rango</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarPicker
                                mode="range"
                                defaultMonth={range?.from}
                                selected={range}
                                onSelect={(r) => onDateRangeChange(filter.key, r)}
                                numberOfMonths={1}
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                      );
                    }

                    return null;
                  })}

                  {activeAdvancedCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onClearAll} className="w-full">
                      <X className="mr-2 size-4" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className={DataTableSharedPage.action}
          >
            <X className="mr-1.5 size-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {activeAdvancedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(state.selects)
            .filter(([, v]) => v !== "all")
            .map(([key, value]) => {
              const cfg = advancedFilters.find(
                (f): f is SelectFilter<T> => isSelectFilter(f) && f.key === key,
              );
              const optionLabel = cfg?.options.find((o) => o.value === value)?.label ?? value;
              return (
                <Badge key={key} variant="secondary" className="gap-1 text-xs font-normal pr-1">
                  <span className="text-muted-foreground">{cfg?.label}:</span> {optionLabel}
                  <button
                    type="button"
                    onClick={() => onSelectChange(key, "all")}
                    className={DataTableSharedPage.removeChip}
                    aria-label={`Quitar filtro ${optionLabel}`}
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              );
            })}

          {Object.entries(state.dateranges)
            .filter(([, v]) => Boolean(v))
            .map(([key, range]) => {
              const cfg = advancedFilters.find((f) => f.key === key);
              return (
                <Badge key={key} variant="secondary" className="gap-1 text-xs font-normal pr-1">
                  <span className="text-muted-foreground">{cfg?.label}:</span>
                  {range?.from && format(range.from, "dd/MM/yy")}
                  {range?.to && ` – ${format(range.to, "dd/MM/yy")}`}
                  <button
                    type="button"
                    onClick={() => onDateRangeChange(key, undefined)}
                    className={DataTableSharedPage.removeChip}
                    aria-label="Quitar filtro de fecha"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}) as <T>(props: FiltersBarProps<T>) => ReactNode;

// ─── PaginationBar ────────────────────────────────────────────────────────────

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className={DataTableSharedPage.blockFlex}>
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        de <span className="font-medium text-foreground">{totalItems}</span> resultados
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1 px-2.5"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline text-xs">Anterior</span>
        </Button>

        {pages.map((page, idx) =>
          page === "…" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis markers are positional, not data-keyed
            <span key={`ellipsis-${idx}`} className={DataTableSharedPage.label}>
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="size-8 p-0 text-xs"
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1 px-2.5"
        >
          <span className="hidden sm:inline text-xs">Siguiente</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className={DataTableSharedPage.blockText}>
      <div className={DataTableSharedPage.blockRounded}>
        <Search className="size-5 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground text-sm">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">Intenta ajustando los filtros activos</p>
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  filters = [],
  pageSize = 10,
  keyExtractor,
  emptyMessage = "No se encontraron resultados",
}: DataTableProps<T>) {
  const [filterState, setFilterState] = useState<FilterState>(() => buildInitialState(filters));
  const [currentPage, setCurrentPage] = useState(1);

  const textFilter = useMemo(() => filters.find(isTextFilter), [filters]);
  const selectFilters = useMemo(() => filters.filter(isSelectFilter), [filters]);
  const daterangeFilters = useMemo(() => filters.filter(isDateRangeFilter), [filters]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const handleTextChange = useCallback(
    (value: string) => {
      setFilterState((s) => ({ ...s, text: value }));
      resetPage();
    },
    [resetPage],
  );

  const handleSelectChange = useCallback(
    (key: string, value: string) => {
      setFilterState((s) => ({ ...s, selects: { ...s.selects, [key]: value } }));
      resetPage();
    },
    [resetPage],
  );

  const handleDateRangeChange = useCallback(
    (key: string, range: DateRange | undefined) => {
      setFilterState((s) => ({ ...s, dateranges: { ...s.dateranges, [key]: range } }));
      resetPage();
    },
    [resetPage],
  );

  const handleClearAll = useCallback(() => {
    setFilterState(buildInitialState(filters));
    resetPage();
  }, [filters, resetPage]);

  const filteredData = useMemo(() => {
    // Hoist boundary Date objects so startOfDay is not called per-row inside the loop.
    type ActiveDateRange = { cfg: DateRangeFilter<T>; from: Date; to: Date | null };
    const activeDateranges: ActiveDateRange[] = daterangeFilters.flatMap((cfg) => {
      const range = filterState.dateranges[cfg.key];
      if (!range?.from) return [];
      return [{ cfg, from: startOfDay(range.from), to: range.to ? startOfDay(range.to) : null }];
    });

    return data.filter((row) => {
      if (
        textFilter &&
        filterState.text &&
        !textFilter.getValue(row).toLowerCase().includes(filterState.text.toLowerCase())
      ) {
        return false;
      }

      for (const cfg of selectFilters) {
        const selected = filterState.selects[cfg.key];
        if (selected && selected !== "all" && !cfg.getValue(row).includes(selected)) {
          return false;
        }
      }

      for (const { cfg, from, to } of activeDateranges) {
        const rawValue = cfg.getValue(row);
        if (!rawValue) return false;
        const date = startOfDay(parseLocalDate(rawValue));
        if (isBefore(date, from)) return false;
        if (to && isAfter(date, to)) return false;
      }

      return true;
    });
  }, [data, filterState, textFilter, selectFilters, daterangeFilters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {filters.length > 0 && (
        <FiltersBar
          filters={filters}
          state={filterState}
          onTextChange={handleTextChange}
          onSelectChange={handleSelectChange}
          onDateRangeChange={handleDateRangeChange}
          onClearAll={handleClearAll}
        />
      )}

      <div className={DataTableSharedPage.blockBorder}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState message={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={keyExtractor(row)} className="group">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
