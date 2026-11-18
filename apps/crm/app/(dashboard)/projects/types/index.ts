import type { ProjectStatus } from "@/lib/types";

export type ProjectSortKey = "name" | "budget" | "status" | "date";

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | "all";
  ministry: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: ProjectSortKey;
  sortOrder: "asc" | "desc";
}

export type ProjectViewMode = "table" | "grid";

export interface ProjectStats {
  active: number;
  planning: number;
  totalBudgetUYU: number;
  totalBudgetUSD: number;
}
