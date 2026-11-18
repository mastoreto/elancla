import { describe, expect, test } from "bun:test";
import type { Budget } from "../../types";
import { filterBudgets, getUsageLevel, getUsagePercent, summarizeBudgets } from "./budget-list";

const make = (overrides: Partial<Budget>): Budget => ({
  id: "1",
  name: "Comedor",
  ministry: "Acción social",
  currency: "UYU",
  totalAmount: 1000,
  usedAmount: 500,
  startDate: new Date("2026-01-01T00:00:00"),
  endDate: new Date("2026-12-31T00:00:00"),
  ...overrides,
});

describe("usage", () => {
  test("computes the percentage and its level", () => {
    expect(getUsagePercent(make({ usedAmount: 690 }))).toBe(69);
    expect(getUsageLevel(89)).toBe("normal");
    expect(getUsageLevel(90)).toBe("near");
    expect(getUsageLevel(100)).toBe("near");
    expect(getUsageLevel(105)).toBe("over");
  });
});

describe("summarizeBudgets", () => {
  test("sums pesos and counts alerts", () => {
    const summary = summarizeBudgets([
      make({ id: "1", usedAmount: 500 }),
      make({ id: "2", usedAmount: 950 }),
      make({ id: "3", usedAmount: 1200 }),
      make({ id: "4", currency: "USD", usedAmount: 10 }),
    ]);
    expect(summary.total).toBe(3000);
    expect(summary.used).toBe(2650);
    expect(summary.available).toBe(350);
    expect(summary.usedPercent).toBe(88);
    expect(summary.overCount).toBe(1);
    expect(summary.nearCount).toBe(1);
    expect(summary.count).toBe(4);
  });
});

describe("filterBudgets", () => {
  test("filters by owner, currency and text", () => {
    const budgets = [make({ id: "1" }), make({ id: "2", ministry: "Niños", currency: "USD" })];
    expect(
      filterBudgets(budgets, { searchQuery: "", ministry: "Niños", currency: "all" }),
    ).toHaveLength(1);
    expect(
      filterBudgets(budgets, { searchQuery: "", ministry: "all", currency: "UYU" }),
    ).toHaveLength(1);
    expect(
      filterBudgets(budgets, { searchQuery: "comedor", ministry: "all", currency: "all" }),
    ).toHaveLength(2);
  });
});
