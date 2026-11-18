import { Heart, Minus } from "lucide-react";
import type { AssemblyReport } from "@/app/(dashboard)/assembly/types";
import { cn } from "@/lib/utils";
import {
  publicReportKpis,
  publicReportMinistries,
  publicReportMovements,
  publicReportMovementsTotal,
  publicReportPeriod,
} from "../data/public-report-data";
import { getValidityEndLabel } from "../utils";
import { PublicReportChart } from "./public-report-chart";
import { PublicShell } from "./public-shell";

const KPI_TONES = {
  income: cn("text-[var(--vida)]"),
  expense: cn("text-primary"),
  neutral: cn("text-foreground"),
} satisfies Record<string, string>;

const MOVEMENT_TONES = {
  income: {
    icon: cn(
      "bg-[linear-gradient(150deg,#dcf3e5,#b3dfc4)] text-[var(--vida)] shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(47,125,87,0.3)]",
    ),
    amount: cn("text-[var(--vida)]"),
  },
  expense: {
    icon: cn(
      "bg-[linear-gradient(150deg,#ffe3e7,#f6b9c3)] text-primary shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(194,58,78,0.35)]",
    ),
    amount: cn("text-primary"),
  },
} satisfies Record<string, { icon: string; amount: string }>;

const publicReportViewInformePage = {
  pill: cn(
    "inline-flex items-center gap-1.5 rounded-full bg-[var(--vida-50)] px-2.5 py-[5px] text-[11.5px] font-bold whitespace-nowrap text-[var(--vida)]",
  ),
  pillDot: cn("size-1.5 rounded-full bg-[var(--vida)]"),
  head: cn("flex flex-col gap-3.5 px-6 pt-[18px] pb-1.5 md:gap-[18px] md:px-9"),
  kicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-primary uppercase"),
  title: cn("font-display text-3xl leading-[1.1] font-semibold tracking-tight md:text-[38px]"),
  period: cn("text-[13px] text-[var(--tinta-apagada)] md:hidden"),
  kpis: cn("mt-1 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3"),
  kpi: cn(
    "flex flex-col gap-1.5 rounded-[20px] bg-card px-4 py-3.5 shadow-(--sombra) md:rounded-[22px] md:py-4",
  ),
  kpiLabel: cn("text-xs text-[var(--tinta-apagada)]"),
  kpiValue: cn("font-display text-2xl font-semibold whitespace-nowrap tabular-nums"),
  sections: cn("grid gap-3.5 px-6 py-3.5 md:grid-cols-[1.3fr_1fr] md:px-9"),
  card: cn("flex flex-col gap-3 rounded-xl bg-card p-[18px] shadow-(--sombra) md:p-5"),
  cardTitle: cn("font-display text-[19px] font-medium"),
  legend: cn("flex gap-4 text-[12.5px] text-[var(--tinta-suave)] md:hidden"),
  legendItem: cn("inline-flex items-center gap-[7px]"),
  legendSwatch: cn("size-2.5 rounded-[3px]"),
  ministries: cn("flex flex-col gap-3.5"),
  ministry: cn("flex flex-col gap-1.5"),
  ministryRow: cn("flex justify-between text-[13px] md:text-[12.5px]"),
  ministryAmount: cn("text-[var(--tinta-suave)] tabular-nums"),
  ministryAmountFull: cn("md:hidden"),
  ministryAmountPercent: cn("hidden md:inline"),
  track: cn(
    "block h-[9px] overflow-hidden rounded-full bg-secondary shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)] md:h-2",
  ),
  fill: cn("block h-full rounded-full"),
  movements: cn("rounded-xl bg-card px-[18px] pt-[18px] pb-2 shadow-(--sombra) md:hidden"),
  movementsTitle: cn("mb-1 block font-display text-[19px] font-medium"),
  movement: cn("flex items-center gap-2.5 border-b border-[rgba(42,21,26,0.08)] py-3"),
  movementIcon: cn("inline-flex size-[34px] shrink-0 items-center justify-center rounded-full"),
  movementText: cn("flex min-w-0 flex-1 flex-col"),
  movementLabel: cn("text-[13.5px] font-bold"),
  movementDate: cn("text-xs text-[var(--tinta-apagada)]"),
  movementAmount: cn("text-[13.5px] font-bold whitespace-nowrap tabular-nums"),
  seeAll: cn("block py-3.5 text-center text-[13px] font-bold text-primary"),
  grow: cn("flex-1"),
};

interface PublicReportViewProps {
  report: AssemblyReport;
}

export function PublicReportView({ report }: PublicReportViewProps) {
  const endLabel = getValidityEndLabel(report.validity);

  return (
    <PublicShell
      headerSlot={
        endLabel ? (
          <span className={publicReportViewInformePage.pill}>
            <span className={publicReportViewInformePage.pillDot} />
            {endLabel}
          </span>
        ) : null
      }
    >
      <div className={publicReportViewInformePage.head}>
        <span className={publicReportViewInformePage.kicker}>{report.assembly}</span>
        <h1 className={publicReportViewInformePage.title}>{report.title}</h1>
        <span className={publicReportViewInformePage.period}>{publicReportPeriod}</span>
        <dl className={publicReportViewInformePage.kpis}>
          {publicReportKpis.map((kpi) => (
            <div className={publicReportViewInformePage.kpi} key={kpi.id}>
              <dt className={publicReportViewInformePage.kpiLabel}>{kpi.label}</dt>
              <dd className={cn(publicReportViewInformePage.kpiValue, KPI_TONES[kpi.tone])}>
                {kpi.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={publicReportViewInformePage.sections}>
        <section className={publicReportViewInformePage.card}>
          <h2 className={publicReportViewInformePage.cardTitle}>Ingresos vs egresos</h2>
          <PublicReportChart />
          <div className={publicReportViewInformePage.legend}>
            <span className={publicReportViewInformePage.legendItem}>
              <span className={cn(publicReportViewInformePage.legendSwatch, "bg-[var(--vida)]")} />
              Ingresos
            </span>
            <span className={publicReportViewInformePage.legendItem}>
              <span className={cn(publicReportViewInformePage.legendSwatch, "bg-primary")} />
              Egresos
            </span>
          </div>
        </section>

        <section
          className={cn(publicReportViewInformePage.card, publicReportViewInformePage.ministries)}
        >
          <h2 className={publicReportViewInformePage.cardTitle}>Gasto por ministerio</h2>
          {publicReportMinistries.map((ministry) => (
            <div className={publicReportViewInformePage.ministry} key={ministry.name}>
              <div className={publicReportViewInformePage.ministryRow}>
                <b>{ministry.name}</b>
                <span className={publicReportViewInformePage.ministryAmount}>
                  <span className={publicReportViewInformePage.ministryAmountFull}>
                    {ministry.amount} ·{" "}
                  </span>
                  {ministry.percent} %
                </span>
              </div>
              <span className={publicReportViewInformePage.track}>
                <span
                  className={publicReportViewInformePage.fill}
                  style={{ width: `${ministry.percent}%`, background: ministry.color }}
                />
              </span>
            </div>
          ))}
        </section>

        <section className={cn(publicReportViewInformePage.movements, "mx-0")}>
          <h2 className={publicReportViewInformePage.movementsTitle}>Últimos movimientos</h2>
          {publicReportMovements.map((movement) => {
            const tone = MOVEMENT_TONES[movement.kind];
            return (
              <div className={publicReportViewInformePage.movement} key={movement.id}>
                <span className={cn(publicReportViewInformePage.movementIcon, tone.icon)}>
                  {movement.kind === "income" ? (
                    <Heart aria-hidden="true" className="size-4" />
                  ) : (
                    <Minus aria-hidden="true" className="size-4" />
                  )}
                </span>
                <div className={publicReportViewInformePage.movementText}>
                  <b className={publicReportViewInformePage.movementLabel}>{movement.label}</b>
                  <span className={publicReportViewInformePage.movementDate}>{movement.date}</span>
                </div>
                <b className={cn(publicReportViewInformePage.movementAmount, tone.amount)}>
                  {movement.amount}
                </b>
              </div>
            );
          })}
          <span className={publicReportViewInformePage.seeAll}>
            Ver los {publicReportMovementsTotal} movimientos
          </span>
        </section>
      </div>
      <div className={publicReportViewInformePage.grow} />
    </PublicShell>
  );
}
