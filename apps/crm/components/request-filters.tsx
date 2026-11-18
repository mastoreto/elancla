"use client";

import { format } from "date-fns";
import { CalendarIcon, Filter, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ministries } from "@/lib/data";
import type { RequestStatus } from "@/lib/types";

interface RequestFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequestStatus | "all";
  onStatusChange: (value: RequestStatus | "all") => void;
  ministryFilter: string | "all";
  onMinistryChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function RequestFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  ministryFilter,
  onMinistryChange,
  dateRange,
  onDateRangeChange,
}: RequestFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar solicitudes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as RequestStatus | "all")}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobada</SelectItem>
            <SelectItem value="rejected">Rechazada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ministryFilter} onValueChange={onMinistryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ministerio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Ministerios</SelectItem>
            {ministries.map((ministry) => (
              <SelectItem key={ministry.id} value={ministry.name}>
                {ministry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild={true}>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 size-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b">
              <Label className="text-sm font-medium">Filtrar por fecha</Label>
            </div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              autoFocus={true}
            />
            {dateRange && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onDateRangeChange(undefined)}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {(statusFilter !== "all" || ministryFilter !== "all" || dateRange) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onStatusChange("all");
              onMinistryChange("all");
              onDateRangeChange(undefined);
            }}
          >
            <Filter className="mr-1.5 size-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
