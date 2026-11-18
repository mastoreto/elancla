import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "up" | "down" | "neutral";
  accent?: boolean;
  icon?: LucideIcon;
  sparkPath?: string;
};

type DashboardMetricStripProps = {
  metrics: DashboardMetric[];
  className?: string;
};

const toneClasses = {
  up: "text-income",
  down: "text-primary",
  neutral: "text-[var(--muted-foreground)]",
};

export function DashboardMetricStrip({ metrics, className }: DashboardMetricStripProps) {
  return (
    <div
      className={cn(
        "mb-7 grid w-full max-w-[calc(100vw_-_2.5rem)] min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] shadow-[var(--sombra)] sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const tone = metric.tone ?? "neutral";

        return (
          <article
            className={cn(
              "relative min-w-0 overflow-hidden bg-[var(--card)] p-5 md:min-h-[160px] md:p-6",
              metric.accent && "bg-[var(--sidebar)] text-[var(--lino)]",
            )}
            key={metric.label}
          >
            <div className="flex items-start justify-between gap-4">
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
                  metric.accent && "text-[rgba(250,248,245,0.62)]",
                )}
              >
                {metric.label}
              </p>
              {Icon ? (
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary",
                    metric.accent && "bg-white/10 text-white",
                  )}
                >
                  <Icon className="size-4" />
                </span>
              ) : null}
            </div>
            <div className="mt-4 font-display text-[2.35rem] font-normal leading-none tracking-normal tabular-nums">
              {metric.value}
            </div>
            <div
              className={cn(
                "mt-3 text-xs font-semibold",
                toneClasses[tone],
                metric.accent && "text-primary-foreground",
              )}
            >
              {metric.detail}
            </div>
            {metric.sparkPath ? (
              <svg
                aria-hidden="true"
                className="absolute bottom-4 right-4 hidden h-7 w-20 opacity-80 sm:block"
                fill="none"
                stroke={metric.accent ? "var(--granada-100)" : "currentColor"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 80 28"
              >
                <path d={metric.sparkPath} />
              </svg>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
