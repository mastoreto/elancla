import type { BudgetCurrency } from "@/app/(dashboard)/budgets/types/index";
import { cn } from "@/lib/utils";

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
      barClassName: "bg-emerald-500",
      textClassName: "text-emerald-700 dark:text-emerald-400",
    };
  }

  if (percentage <= 90) {
    return {
      barClassName: "bg-amber-500",
      textClassName: "text-amber-700 dark:text-amber-400",
    };
  }

  return {
    barClassName: "bg-rose-500",
    textClassName: "text-rose-700 dark:text-rose-400",
  };
}

export function BudgetProgressBar({ currency, totalAmount, usedAmount }: BudgetProgressBarProps) {
  const percentage = totalAmount > 0 ? (usedAmount / totalAmount) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const tone = getUsageTone(percentage);

  return (
    <div className="space-y-2">
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          aria-hidden="true"
          className={cn("h-full rounded-full transition-all", tone.barClassName)}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
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
