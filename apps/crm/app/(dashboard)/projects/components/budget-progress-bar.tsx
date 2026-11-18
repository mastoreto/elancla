"use client";

import { cn } from "@/lib/utils";

const budgetProgressBarProjectsPage = {
  container: cn("w-full"),
  amounts: cn("mb-1.5 flex items-center justify-between text-sm"),
  amountMuted: cn("text-muted-foreground"),
  amountStrong: cn("font-medium"),
  track: cn("w-full overflow-hidden rounded-full bg-muted"),
  bar: cn("h-full rounded-full transition-all duration-500"),
  footer: cn("mt-1 flex items-center justify-between text-xs"),
  percentage: cn("font-medium"),
};

const budgetProgressBarSizeProjectsPage = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
} as const;

interface BudgetProgressBarProps {
  budget: number;
  spent: number;
  currency: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetProgressBar({
  budget,
  spent,
  currency,
  showLabels = true,
  size = "md",
}: BudgetProgressBarProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;
  const isNearLimit = percentage >= 80 && percentage < 100;

  const barColor = isOverBudget ? "bg-expense" : isNearLimit ? "bg-oro" : "bg-income";

  return (
    <div className={budgetProgressBarProjectsPage.container}>
      {showLabels && (
        <div className={budgetProgressBarProjectsPage.amounts}>
          <span className={budgetProgressBarProjectsPage.amountMuted}>
            {formatCurrency(spent, currency)} gastado
          </span>
          <span className={budgetProgressBarProjectsPage.amountStrong}>
            {formatCurrency(remaining, currency)} disponible
          </span>
        </div>
      )}

      <div
        className={cn(budgetProgressBarProjectsPage.track, budgetProgressBarSizeProjectsPage[size])}
      >
        <div
          className={cn(budgetProgressBarProjectsPage.bar, barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showLabels && (
        <div className={budgetProgressBarProjectsPage.footer}>
          <span
            className={cn(
              budgetProgressBarProjectsPage.percentage,
              isOverBudget
                ? "text-expense"
                : isNearLimit
                  ? "text-warning"
                  : "text-muted-foreground",
            )}
          >
            {percentage.toFixed(0)}% utilizado
          </span>
          <span className={budgetProgressBarProjectsPage.amountMuted}>
            Presupuesto: {formatCurrency(budget, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
