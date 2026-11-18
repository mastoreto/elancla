"use client";

import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const statusTabs: { value: RequestStatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

const requestsToolbarRequestsPage = {
  container: cn("flex flex-col gap-4"),
  row: cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"),
  search: cn("relative w-full lg:max-w-sm"),
  searchIcon: cn("absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"),
  searchInput: cn("pl-9"),
  filters: cn("flex flex-wrap items-center gap-2"),
  ministrySelect: cn("w-44"),
  dateTrigger: cn("w-48 justify-start text-left font-normal"),
  dateIcon: cn("mr-2 size-4"),
  calendarPopover: cn("w-auto p-0"),
  tabs: cn("flex flex-wrap gap-2"),
  tab: cn(
    "inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-medium text-tinta-suave transition hover:border-foreground",
  ),
  tabActive: cn("border-primary bg-primary/10 text-primary"),
  tabCount: cn("rounded-full bg-muted px-1.5 text-xs tabular-nums"),
};

export function RequestsToolbar({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  counts,
  ministry,
  onMinistryChange,
  dateRange,
  onDateRangeChange,
}: RequestsToolbarProps) {
  return (
    <div className={requestsToolbarRequestsPage.container}>
      <div className={requestsToolbarRequestsPage.row}>
        <div className={requestsToolbarRequestsPage.search}>
          <Search aria-hidden="true" className={requestsToolbarRequestsPage.searchIcon} />
          <Input
            aria-label="Buscar solicitud, ministerio o líder"
            className={requestsToolbarRequestsPage.searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar solicitud, ministerio o líder…"
            value={searchQuery}
          />
        </div>

        <div className={requestsToolbarRequestsPage.filters}>
          <Select onValueChange={onMinistryChange} value={ministry}>
            <SelectTrigger
              aria-label="Filtrar por ministerio"
              className={requestsToolbarRequestsPage.ministrySelect}
            >
              <SelectValue placeholder="Ministerio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los ministerios</SelectItem>
              {ministries.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild={true}>
              <Button className={requestsToolbarRequestsPage.dateTrigger} variant="outline">
                <CalendarIcon aria-hidden="true" className={requestsToolbarRequestsPage.dateIcon} />
                {dateRange?.from
                  ? `${format(dateRange.from, "dd/MM")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM")}` : ""}`
                  : "Rango de fechas"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className={requestsToolbarRequestsPage.calendarPopover}>
              <Calendar
                autoFocus={true}
                mode="range"
                numberOfMonths={2}
                onSelect={onDateRangeChange}
                selected={dateRange}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: segmented toggle; a fieldset would need its default borders reset. */}
      <div
        aria-label="Estado de la solicitud"
        className={requestsToolbarRequestsPage.tabs}
        role="group"
      >
        {statusTabs.map((tab) => (
          <button
            aria-pressed={status === tab.value}
            className={cn(
              requestsToolbarRequestsPage.tab,
              status === tab.value && requestsToolbarRequestsPage.tabActive,
            )}
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            type="button"
          >
            {tab.label}
            <span className={requestsToolbarRequestsPage.tabCount}>{counts[tab.value]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
