import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";
import { formatCurrency, formatShortDate } from "./dashboard-formatters";

type RecentFinancialMovementsCardProps = {
  movements: Movement[];
};

const movementTone = {
  income: {
    label: "Ingreso",
    icon: ArrowDownRight,
    className: "bg-emerald-50 text-emerald-700",
    amountClassName: "text-emerald-700",
    sign: "+",
  },
  expense: {
    label: "Gasto",
    icon: ArrowUpRight,
    className: "bg-primary/10 text-primary",
    amountClassName: "text-primary",
    sign: "-",
  },
};

export function RecentFinancialMovementsCard({ movements }: RecentFinancialMovementsCardProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader
        action={
          <Link
            className="hidden items-center gap-1.5 text-xs font-semibold text-[var(--dashboard-ink-soft)] transition hover:text-primary sm:inline-flex"
            href={getChurchRoutePath("movements")}
          >
            Ver todo
            <ArrowRight className="size-3" />
          </Link>
        }
        subtitle="Últimas transacciones registradas"
        title="Movimientos recientes"
      />

      <div className="divide-y divide-[var(--dashboard-border)]">
        {movements.map((movement, index) => {
          const tone = movementTone[movement.type];
          const Icon = tone.icon;

          return (
            <article
              className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 px-1 py-3 transition hover:bg-[var(--dashboard-surface-muted)] sm:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_auto] sm:gap-3"
              key={movement.id}
            >
              <span className="font-mono text-[11px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {movement.concept}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  {movement.description}
                  {movement.project ? ` · ${movement.project}` : ""}
                </div>
              </div>
              <div className="hidden font-mono text-[11px] uppercase text-muted-foreground sm:block">
                {formatShortDate(movement.date)}
              </div>
              <span
                className={cn(
                  "hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] sm:inline-flex",
                  tone.className,
                )}
              >
                <Icon className="mr-1 size-3" />
                {tone.label}
              </span>
              <span
                className={cn(
                  "col-start-2 min-w-0 text-left text-sm font-semibold tabular-nums sm:col-auto sm:min-w-[6.75rem] sm:text-right",
                  tone.amountClassName,
                )}
              >
                {tone.sign}
                {formatCurrency(movement.amount, movement.currency)}
              </span>
            </article>
          );
        })}
      </div>
    </DashboardCard>
  );
}
