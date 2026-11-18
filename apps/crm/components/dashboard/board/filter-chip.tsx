import type * as React from "react";
import { cn } from "@/lib/utils";

const filterChipDashboardPage = {
  base: cn(
    "inline-flex h-[34px] items-center gap-[7px] rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition",
  ),
  active: cn("bg-foreground text-white"),
  idle: cn(
    "bg-card text-[var(--tinta-suave)] shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] hover:bg-secondary",
  ),
  count: cn("tabular-nums"),
};

interface FilterChipProps extends Omit<React.ComponentProps<"button">, "className"> {
  active?: boolean;
  count?: number;
  className?: string;
}

export function FilterChip({
  active = false,
  count,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        filterChipDashboardPage.base,
        active ? filterChipDashboardPage.active : filterChipDashboardPage.idle,
        className,
      )}
      type="button"
      {...props}
    >
      {children}
      {count === undefined ? null : <span className={filterChipDashboardPage.count}>{count}</span>}
    </button>
  );
}
