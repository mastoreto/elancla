import type { Project, ProjectStatus } from "@/lib/types";
import type { ProjectFilters, ProjectStats } from "../types";

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
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: "date",
  sortOrder: "desc",
};

function compareProjects(a: Project, b: Project, sortBy: ProjectFilters["sortBy"]): number {
  switch (sortBy) {
    case "name":
      return a.name.localeCompare(b.name);
    case "budget":
      return a.budget - b.budget;
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    default:
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  }
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  const query = filters.search.trim().toLowerCase();
  const direction = filters.sortOrder === "asc" ? 1 : -1;

  return projects
    .filter((project) => {
      if (query) {
        const matches =
          project.name.toLowerCase().includes(query) ||
          (project.description?.toLowerCase().includes(query) ?? false);
        if (!matches) return false;
      }
      if (filters.status !== "all" && project.status !== filters.status) return false;
      if (filters.ministry !== "all" && !project.ministries.includes(filters.ministry)) {
        return false;
      }
      const start = new Date(project.startDate);
      if (filters.dateFrom && start < filters.dateFrom) return false;
      if (filters.dateTo && start > filters.dateTo) return false;
      return true;
    })
    .sort((a, b) => direction * compareProjects(a, b, filters.sortBy));
}

export function getProjectStats(projects: Project[]): ProjectStats {
  const totalFor = (currency: Project["currency"]) =>
    projects
      .filter((project) => project.currency === currency)
      .reduce((sum, p) => sum + p.budget, 0);

  return {
    active: projects.filter((project) => project.status === "in_progress").length,
    planning: projects.filter((project) => project.status === "planning").length,
    totalBudgetUYU: totalFor("UYU"),
    totalBudgetUSD: totalFor("USD"),
  };
}

const NEAR_LIMIT_PERCENT = 80;

export type BudgetAlert = "over" | "near" | null;

export function getBudgetAlert(project: Pick<Project, "budget" | "spent">): BudgetAlert {
  if (project.budget <= 0) return null;
  if (project.spent > project.budget) return "over";
  return (project.spent / project.budget) * 100 >= NEAR_LIMIT_PERCENT ? "near" : null;
}
