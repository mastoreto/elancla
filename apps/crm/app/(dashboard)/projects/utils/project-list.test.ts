import { describe, expect, test } from "bun:test";
import type { Project } from "@/lib/types";
import { DEFAULT_PROJECT_FILTERS, filterProjects } from "./project-list";

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
  test("sorts by creation order and filters by status", () => {
    expect(filterProjects(projects, DEFAULT_PROJECT_FILTERS).map((p) => p.id)).toEqual(["1", "2"]);
    expect(
      filterProjects(projects, { ...DEFAULT_PROJECT_FILTERS, status: "in_progress" }).map(
        (p) => p.id,
      ),
    ).toEqual(["1"]);
  });

  test("searches by name and sorts by name ascending", () => {
    expect(filterProjects(projects, { ...DEFAULT_PROJECT_FILTERS, search: "temp" })).toHaveLength(
      1,
    );
    expect(
      filterProjects(projects, { ...DEFAULT_PROJECT_FILTERS, sortBy: "name" }).map((p) => p.id),
    ).toEqual(["1", "2"]);
  });
});
