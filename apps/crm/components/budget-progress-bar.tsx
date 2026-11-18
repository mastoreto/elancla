"use client";

import { cn } from "@/lib/utils";

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

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  const barColor = isOverBudget ? "bg-expense" : isNearLimit ? "bg-oro" : "bg-income";

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">{formatCurrency(spent, currency)} gastado</span>
          <span className="font-medium">{formatCurrency(remaining, currency)} disponible</span>
        </div>
      )}

      <div className={cn("w-full bg-muted rounded-full overflow-hidden", heightClass)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-xs mt-1">
          <span
            className={cn(
              "font-medium",
              isOverBudget
                ? "text-expense"
                : isNearLimit
                  ? "text-warning"
                  : "text-muted-foreground",
            )}
          >
            {percentage.toFixed(0)}% utilizado
          </span>
          <span className="text-muted-foreground">
            Presupuesto: {formatCurrency(budget, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
