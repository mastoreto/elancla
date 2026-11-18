import type { Budget } from "../../types";

export const BUDGETS_PAGE_SIZE = 6;

/** Usage at or above this percentage counts as "near the limit". */
export const NEAR_LIMIT_PERCENT = 90;

export interface BudgetFilters {
  searchQuery: string;
  ministry: string;
  currency: string;
}

export function getBudgetOwner(budget: Pick<Budget, "ministry" | "project">): string {
  return budget.ministry ?? budget.project ?? "";
}

export function getUsagePercent(budget: Pick<Budget, "totalAmount" | "usedAmount">): number {
  return budget.totalAmount > 0 ? Math.round((budget.usedAmount / budget.totalAmount) * 100) : 0;
}

export type BudgetUsageLevel = "normal" | "near" | "over";

export function getUsageLevel(percent: number): BudgetUsageLevel {
  if (percent > 100) return "over";
  return percent >= NEAR_LIMIT_PERCENT ? "near" : "normal";
}

export function filterBudgets(budgets: Budget[], filters: BudgetFilters): Budget[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return budgets.filter((budget) => {
    if (filters.currency !== "all" && budget.currency !== filters.currency) return false;
    if (filters.ministry !== "all" && getBudgetOwner(budget) !== filters.ministry) return false;
    return !query || `${budget.name} ${getBudgetOwner(budget)}`.toLowerCase().includes(query);
  });
}

export interface BudgetSummary {
  /** Totals in pesos only: dollar budgets are not converted. */
  total: number;
  used: number;
  available: number;
  usedPercent: number;
  availablePercent: number;
  count: number;
  overCount: number;
  nearCount: number;
}

export function summarizeBudgets(budgets: Budget[]): BudgetSummary {
  const pesos = budgets.filter((budget) => budget.currency === "UYU");
  const total = pesos.reduce((sum, budget) => sum + budget.totalAmount, 0);
  const used = pesos.reduce((sum, budget) => sum + budget.usedAmount, 0);
  const levels = budgets.map((budget) => getUsageLevel(getUsagePercent(budget)));
  const usedPercent = total > 0 ? Math.round((used / total) * 100) : 0;

  return {
    total,
    used,
    available: total - used,
    usedPercent,
    availablePercent: total > 0 ? 100 - usedPercent : 0,
    count: budgets.length,
    overCount: levels.filter((level) => level === "over").length,
    nearCount: levels.filter((level) => level === "near").length,
  };
}

export function paginateBudgets(budgets: Budget[], page: number): Budget[] {
  const start = (page - 1) * BUDGETS_PAGE_SIZE;
  return budgets.slice(start, start + BUDGETS_PAGE_SIZE);
}
