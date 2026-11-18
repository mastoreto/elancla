import type { MinistrySummary } from "../types";

const PERCENT = 100;

export function getExecutionPercent(ministry: MinistrySummary): number {
  if (ministry.budget <= 0) {
    return 0;
  }
  return Math.round((ministry.executed / ministry.budget) * PERCENT);
}

export function formatMoney(currency: MinistrySummary["currency"], amount: number): string {
  return `${currency} ${amount.toLocaleString("es-UY")}`;
}

export function getLeaderInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
