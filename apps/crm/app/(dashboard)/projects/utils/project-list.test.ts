import { describe, expect, test } from "bun:test";
import type { Project } from "@/lib/types";
import {
  DEFAULT_PROJECT_FILTERS,
  filterProjects,
  getBudgetAlert,
  getProjectStats,
} from "./project-list";

const base = {
  description: "",
  ministries: ["Jóvenes"],
  currency: "UYU",
  endDate: undefined,
} as const;

const projects = [
  {
    ...base,
    id: "1",
    name: "Campamento",
    status: "in_progress",
    budget: 100,
    spent: 90,
    startDate: "2026-01-10",
  },
  {
    ...base,
    id: "2",
    name: "Templo",
    status: "planning",
    budget: 500,
    spent: 0,
    startDate: "2026-03-01",
  },
] as unknown as Project[];

describe("filterProjects", () => {
  test("filters by status and sorts by newest start date", () => {
    expect(filterProjects(projects, DEFAULT_PROJECT_FILTERS).map((p) => p.id)).toEqual(["2", "1"]);
    expect(
      filterProjects(projects, { ...DEFAULT_PROJECT_FILTERS, status: "in_progress" }).map(
        (p) => p.id,
      ),
    ).toEqual(["1"]);
  });

  test("searches by name", () => {
    expect(filterProjects(projects, { ...DEFAULT_PROJECT_FILTERS, search: "temp" })).toHaveLength(
      1,
    );
  });
});

describe("getBudgetAlert", () => {
  test("flags near-limit and over-budget projects", () => {
    expect(getBudgetAlert({ budget: 100, spent: 90 })).toBe("near");
    expect(getBudgetAlert({ budget: 100, spent: 120 })).toBe("over");
    expect(getBudgetAlert({ budget: 100, spent: 10 })).toBeNull();
  });
});

describe("getProjectStats", () => {
  test("counts active projects and sums budgets by currency", () => {
    expect(getProjectStats(projects)).toEqual({
      active: 1,
      planning: 1,
      totalBudgetUYU: 600,
      totalBudgetUSD: 0,
    });
  });
});
