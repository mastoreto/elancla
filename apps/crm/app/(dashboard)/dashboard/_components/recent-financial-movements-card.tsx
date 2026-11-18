import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard";
import { getChurchRoutePath } from "@/lib/church";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShortDate } from "./dashboard-formatters";

const recentFinancialMovementsCardDashboardPage = {
  link: cn(
    "hidden items-center gap-1.5 text-xs font-semibold text-tinta-suave transition hover:text-primary sm:inline-flex",
  ),
  linkIcon: cn("size-3"),
  list: cn("divide-y divide-border"),
  row: cn(
    "grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 px-1 py-3 transition hover:bg-bruma sm:grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_auto] sm:gap-3",
  ),
  index: cn("font-mono text-[11px] text-muted-foreground"),
  body: cn("min-w-0"),
  concept: cn("truncate text-sm font-semibold text-foreground"),
  description: cn("mt-0.5 truncate text-[11.5px] text-muted-foreground"),
  chip: cn("mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold"),
  date: cn("hidden font-mono text-[11px] uppercase text-muted-foreground sm:block"),
  badge: cn(
    "hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] sm:inline-flex",
  ),
  badgeIcon: cn("mr-1 size-3"),
  amount: cn(
    "col-start-2 min-w-0 text-left text-sm font-semibold tabular-nums sm:col-auto sm:min-w-[6.75rem] sm:text-right",
  ),
};

type RecentFinancialMovementsCardProps = {
  movements: Movement[];
};

const reconciliationChip = {
  reconciled: { label: "Conciliado", className: "bg-success-surface text-income" },
  pending: { label: "Por conciliar", className: "bg-warning-surface text-warning" },
  flagged: { label: "Observado", className: "bg-accent text-accent-foreground" },
} as const;

const movementTone = {
  income: {
    label: "Ingreso",
    icon: ArrowDownRight,
    className: "bg-success-surface text-income",
    amountClassName: "text-income",
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
            className={recentFinancialMovementsCardDashboardPage.link}
            href={getChurchRoutePath("movements")}
          >
            Ver todo
            <ArrowRight className={recentFinancialMovementsCardDashboardPage.linkIcon} />
          </Link>
        }
        subtitle="Últimas transacciones registradas"
        title="Movimientos recientes"
      />

      <div className={recentFinancialMovementsCardDashboardPage.list}>
        {movements.map((movement, index) => {
          const tone = movementTone[movement.type];
          const Icon = tone.icon;

          return (
            <article className={recentFinancialMovementsCardDashboardPage.row} key={movement.id}>
              <span className={recentFinancialMovementsCardDashboardPage.index}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={recentFinancialMovementsCardDashboardPage.body}>
                <div className={recentFinancialMovementsCardDashboardPage.concept}>
                  {movement.concept}
                </div>
                <div className={recentFinancialMovementsCardDashboardPage.description}>
                  {movement.description}
                  {movement.project ? ` · ${movement.project}` : ""}
                </div>
                {movement.reconciliation ? (
                  <span
                    className={cn(
                      recentFinancialMovementsCardDashboardPage.chip,
                      reconciliationChip[movement.reconciliation].className,
                    )}
                  >
                    {reconciliationChip[movement.reconciliation].label}
                  </span>
                ) : null}
              </div>
              <div className={recentFinancialMovementsCardDashboardPage.date}>
                {formatShortDate(movement.date)}
              </div>
              <span className={cn(recentFinancialMovementsCardDashboardPage.badge, tone.className)}>
                <Icon className={recentFinancialMovementsCardDashboardPage.badgeIcon} />
                {tone.label}
              </span>
              <span
                className={cn(
                  recentFinancialMovementsCardDashboardPage.amount,
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
