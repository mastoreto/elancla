import type * as React from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = React.ComponentProps<"section">;

type DashboardCardHeaderProps = React.ComponentProps<"div"> & {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

const dashboardCardDashboardPage = {
  heading: cn("font-display text-xl font-medium leading-none tracking-normal text-foreground"),
};

export function DashboardCard({ className, ...props }: DashboardCardProps) {
  return (
    <section
      className={cn(
        "w-full max-w-[calc(100vw_-_2.5rem)] min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-foreground shadow-[var(--sombra)] md:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function DashboardCardHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: DashboardCardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex min-w-0 flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <h2 className={dashboardCardDashboardPage.heading}>{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
