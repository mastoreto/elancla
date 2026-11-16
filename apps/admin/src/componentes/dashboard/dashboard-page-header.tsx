import type * as React from "react";
import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = React.ComponentProps<"header"> & {
  kicker: string;
  title: React.ReactNode;
  emphasis?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export function DashboardPageHeader({
  kicker,
  title,
  emphasis,
  description,
  actions,
  className,
  ...props
}: DashboardPageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-7 flex w-full max-w-[calc(100vw_-_2.5rem)] min-w-0 flex-col gap-5 border-b border-[var(--dashboard-border)] pb-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 max-w-full">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {kicker}
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-none tracking-normal text-foreground">
          {title}
          {emphasis ? (
            <>
              {" "}
              <em className="font-normal text-primary">{emphasis}</em>
            </>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-3 max-w-full break-words text-sm leading-6 text-[var(--dashboard-ink-soft)] whitespace-normal sm:max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
