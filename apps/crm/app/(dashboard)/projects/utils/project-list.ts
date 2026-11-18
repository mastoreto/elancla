import type { Project, ProjectStatus } from "@/lib/types";
import type { ProjectFilters, ProjectSortKey } from "../types";

const STATUS_ORDER: Record<ProjectStatus, number> = {
  planning: 0,
  in_progress: 1,
  finished: 2,
  closed: 3,
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: "",
  status: "all",
  ministry: "all",
  sortBy: "date",
};

/** "Fecha" is creation order (ids grow with time); budgets list the largest first. */
const SORT_DIRECTION: Record<ProjectSortKey, 1 | -1> = {
  date: 1,
  budget: -1,
  name: 1,
  status: 1,
};

function compareProjects(a: Project, b: Project, sortBy: ProjectSortKey): number {
  switch (sortBy) {
    case "name":
      return a.name.localeCompare(b.name);
    case "budget":
      return a.budget - b.budget;
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    default:
      return Number(a.id) - Number(b.id);
  }
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  const query = filters.search.trim().toLowerCase();

  return projects
    .filter((project) => {
      if (query) {
        const matches =
          project.name.toLowerCase().includes(query) ||
          (project.description?.toLowerCase().includes(query) ?? false);
        if (!matches) return false;
      }
      if (filters.status !== "all" && project.status !== filters.status) return false;
      return filters.ministry === "all" || project.ministries.includes(filters.ministry);
    })
    .sort((a, b) => SORT_DIRECTION[filters.sortBy] * compareProjects(a, b, filters.sortBy));
}
