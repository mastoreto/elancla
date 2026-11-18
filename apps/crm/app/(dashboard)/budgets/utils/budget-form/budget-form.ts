import type { Budget, BudgetFormValues } from "../../types";

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string, fallback: Date) {
  if (!value) {
    return fallback;
  }

  return new Date(`${value}T00:00:00`);
}

export function createDefaultFormValues(): BudgetFormValues {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  return {
    name: "",
    ownerType: "MINISTRY",
    ministry: "",
    project: "",
    currency: "UYU",
    totalAmount: "",
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

export function mapBudgetToFormValues(budget: Budget): BudgetFormValues {
  return {
    name: budget.name,
    ownerType: budget.project ? "PROJECT" : "MINISTRY",
    ministry: budget.ministry ?? "",
    project: budget.project ?? "",
    currency: budget.currency,
    totalAmount: String(budget.totalAmount),
    startDate: formatDateInput(budget.startDate),
    endDate: formatDateInput(budget.endDate),
  };
}

export function mapFormValuesToBudget(
  values: BudgetFormValues,
  id: string,
  usedAmount: number,
): Budget {
  const fallbackStartDate = new Date();
  const fallbackEndDate = new Date(fallbackStartDate);
  fallbackEndDate.setMonth(fallbackEndDate.getMonth() + 1);

  return {
    id,
    name: values.name,
    ministry: values.ownerType === "MINISTRY" ? values.ministry || undefined : undefined,
    project: values.ownerType === "PROJECT" ? values.project || undefined : undefined,
    currency: values.currency ?? "UYU",
    totalAmount: Number(values.totalAmount) || 0,
    usedAmount,
    startDate: parseDateInput(values.startDate, fallbackStartDate),
    endDate: parseDateInput(values.endDate, fallbackEndDate),
  };
}
