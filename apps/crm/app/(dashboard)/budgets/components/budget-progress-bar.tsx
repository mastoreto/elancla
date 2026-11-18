import type { BudgetCurrency } from "@/app/(dashboard)/budgets/types/index";
import { cn } from "@/lib/utils";

const budgetProgressBarBudgetsPage = {
  track: cn("bg-muted h-2 overflow-hidden rounded-full"),
  labels: cn("flex items-center justify-between gap-3 text-xs"),
  bar: cn("h-full rounded-full transition-all"),
};

type BudgetProgressBarProps = {
  currency: BudgetCurrency;
  totalAmount: number;
  usedAmount: number;
};

function formatCurrency(currency: BudgetCurrency, amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getUsageTone(percentage: number) {
  if (percentage < 70) {
    return {
      barClassName: "bg-income",
      textClassName: "text-income",
    };
  }

  if (percentage <= 90) {
    return {
      barClassName: "bg-oro",
      textClassName: "text-warning",
    };
  }

  return {
    barClassName: "bg-granada",
    textClassName: "text-accent-foreground dark:text-expense",
  };
}

export function BudgetProgressBar({ currency, totalAmount, usedAmount }: BudgetProgressBarProps) {
  const percentage = totalAmount > 0 ? (usedAmount / totalAmount) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const tone = getUsageTone(percentage);

  return (
    <div className="space-y-2">
      <div className={budgetProgressBarBudgetsPage.track}>
        <div
          aria-hidden="true"
          className={cn(budgetProgressBarBudgetsPage.bar, tone.barClassName)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      <div className={budgetProgressBarBudgetsPage.labels}>
        <span className="text-muted-foreground">
          {`Usado: ${formatCurrency(currency, usedAmount)} de ${formatCurrency(currency, totalAmount)}`}
        </span>
        <span className={cn("font-medium", tone.textClassName)}>
          {`${Math.round(percentage)}%`}
        </span>
      </div>
    </div>
  );
}
