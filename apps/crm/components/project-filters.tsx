"use client";

import { format } from "date-fns";
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | "all";
  ministry: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: "name" | "budget" | "status" | "date";
  sortOrder: "asc" | "desc";
}

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

export function ProjectFiltersComponent({ filters, onFiltersChange }: ProjectFiltersProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const activeFiltersCount = [
    filters.status !== "all",
    filters.ministry !== "all",
    filters.dateFrom || filters.dateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      search: "",
      status: "all",
      ministry: "all",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as ProjectStatus | "all" })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="planning">Planificación</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="finished">Finalizado</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.ministry}
            onValueChange={(value) => onFiltersChange({ ...filters, ministry: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ministerio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Ministerios</SelectItem>
              <SelectItem value="General">General</SelectItem>
              {ministries.map((ministry) => (
                <SelectItem key={ministry.id} value={ministry.name}>
                  {ministry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild={true}>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  (filters.dateFrom || filters.dateTo) && "text-foreground",
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {filters.dateFrom && filters.dateTo ? (
                  <>
                    {format(filters.dateFrom, "MMM d")} - {format(filters.dateTo, "MMM d")}
                  </>
                ) : filters.dateFrom ? (
                  <>From {format(filters.dateFrom, "MMM d")}</>
                ) : filters.dateTo ? (
                  <>Until {format(filters.dateTo, "MMM d")}</>
                ) : (
                  <span className="text-muted-foreground">Rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                <div className="border-r">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">Fecha de Inicio</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                    autoFocus={true}
                  />
                </div>
                <div>
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">Fecha de Fin</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                  />
                </div>
              </div>
              <div className="p-3 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined });
                    setDatePopoverOpen(false);
                  }}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [
                ProjectFilters["sortBy"],
                ProjectFilters["sortOrder"],
              ];
              onFiltersChange({ ...filters, sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SlidersHorizontal className="mr-2 size-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="budget-desc">Budget high-low</SelectItem>
              <SelectItem value="budget-asc">Budget low-high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.replace("_", " ")}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, status: "all" })}
                className="ml-1 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.ministry !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Ministry: {filters.ministry}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, ministry: "all" })}
                className="ml-1 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              Date range
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined })
                }
                className="ml-1 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
