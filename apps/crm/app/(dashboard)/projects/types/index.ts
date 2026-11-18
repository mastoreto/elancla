import type { ProjectStatus } from "@/lib/types";

export type ProjectSortKey = "name" | "budget" | "status" | "date";

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | "all";
  ministry: string;
  sortBy: ProjectSortKey;
}

export type ProjectViewMode = "table" | "grid";
