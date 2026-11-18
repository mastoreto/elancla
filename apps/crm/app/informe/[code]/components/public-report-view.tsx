import { Church } from "lucide-react";
import type { AssemblyReport } from "@/app/(dashboard)/assembly/types";
import { ReportBarChart } from "@/app/(dashboard)/reports/components/report-bar-chart";
import { ReportShareDonut } from "@/app/(dashboard)/reports/components/report-share-donut";
import { getReportDetail } from "@/app/(dashboard)/reports/data/report-seeds";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { cn } from "@/lib/utils";

const FALLBACK_REPORT_ID = "resumen-general-octubre-2026";

const publicReportViewInformePage = {
  stack: cn("flex flex-col gap-4"),
  brand: cn("flex flex-wrap items-center gap-3"),
  mark: cn(
    "inline-flex size-10 items-center justify-center rounded-xl bg-(image:--grad-granada) text-white",
    "shadow-[0_8px_18px_-8px_rgba(194,58,78,0.9)]",
  ),
  markIcon: cn("size-5"),
  brandText: cn("flex flex-1 flex-col"),
  brandName: cn("font-display text-lg font-medium"),
  brandKind: cn("text-xs text-[var(--tinta-apagada)]"),
  until: cn(
    "rounded-full bg-[var(--vida-50)] px-3 py-1 text-xs font-bold text-[var(--vida)]",
    "shadow-[inset_0_0_0_1px_rgba(39,109,76,0.2)]",
  ),
  kicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-[var(--oro-texto)] uppercase"),
  title: cn("font-display text-3xl leading-tight font-semibold text-balance"),
  subtitle: cn("text-sm text-[var(--tinta-suave)]"),
  stats: cn("grid grid-cols-2 gap-3 sm:grid-cols-4"),
  stat: cn("flex flex-col gap-2 rounded-3xl bg-card p-4 shadow-(--sombra)"),
  statHighlighted: cn("bg-(image:--grad-granada) text-white"),
  statLabel: cn("text-[13px] font-semibold text-[var(--tinta-suave)]"),
  statLabelHighlighted: cn("text-white/90"),
  statValue: cn("font-display text-2xl leading-none font-semibold tabular-nums"),
  card: cn("p-5"),
  movements: cn("flex flex-col"),
  movement: cn("flex items-center gap-3 border-b border-border py-3 last:border-b-0"),
  movementText: cn("flex min-w-0 flex-1 flex-col"),
  movementName: cn("text-sm font-bold"),
  movementDate: cn("text-xs text-[var(--tinta-apagada)]"),
  amount: cn("text-sm font-bold whitespace-nowrap tabular-nums"),
  income: cn("text-[var(--vida)]"),
  expense: cn("text-primary"),
  footer: cn("flex items-center justify-center gap-2 pt-2 text-[13px] text-[var(--tinta-apagada)]"),
  footerMark: cn("inline-flex size-5 rounded-md bg-(image:--grad-granada)"),
};

interface PublicReportViewProps {
  report: AssemblyReport;
}

/** Attendee view: the same report on phone and desktop, readable at 360 px. */
export function PublicReportView({ report }: PublicReportViewProps) {
  const detail = getReportDetail(FALLBACK_REPORT_ID);
  if (!detail) return null;

  return (
    <div className={publicReportViewInformePage.stack}>
      <header className={publicReportViewInformePage.brand}>
        <span className={publicReportViewInformePage.mark}>
          <Church aria-hidden="true" className={publicReportViewInformePage.markIcon} />
        </span>
        <div className={publicReportViewInformePage.brandText}>
          <b className={publicReportViewInformePage.brandName}>Iglesia El Ancla</b>
          <span className={publicReportViewInformePage.brandKind}>Informe de asamblea</span>
        </div>
        <span className={publicReportViewInformePage.until}>Hasta las 14:00</span>
      </header>

      <div>
        <p className={publicReportViewInformePage.kicker}>{report.assembly}</p>
        <h1 className={publicReportViewInformePage.title}>{report.title}</h1>
        <p className={publicReportViewInformePage.subtitle}>
          Del 1 al 30 de noviembre · generado por Tesorería
        </p>
      </div>

      <div className={publicReportViewInformePage.stats}>
        {detail.kpis.map((kpi) => {
          const highlighted = kpi.label === "Balance";
          return (
            <div
              className={cn(
                publicReportViewInformePage.stat,
                highlighted && publicReportViewInformePage.statHighlighted,
              )}
              key={kpi.label}
            >
              <span
                className={cn(
                  publicReportViewInformePage.statLabel,
                  highlighted && publicReportViewInformePage.statLabelHighlighted,
                )}
              >
                {kpi.label}
              </span>
              <b className={publicReportViewInformePage.statValue}>{kpi.value}</b>
            </div>
          );
        })}
      </div>

      <BoardCard className={publicReportViewInformePage.card}>
        <BoardCardHeader title="Ingresos vs egresos" />
        <ReportBarChart months={detail.months} />
      </BoardCard>

      <BoardCard className={publicReportViewInformePage.card}>
        <BoardCardHeader title="Gasto por ministerio" />
        <ReportShareDonut shares={detail.shares} />
      </BoardCard>

      <BoardCard className={publicReportViewInformePage.card}>
        <BoardCardHeader title="Últimos movimientos" />
        <ul className={publicReportViewInformePage.movements}>
          {detail.movements.map((movement) => (
            <li className={publicReportViewInformePage.movement} key={movement.id}>
              <div className={publicReportViewInformePage.movementText}>
                <span className={publicReportViewInformePage.movementName}>{movement.concept}</span>
                <span className={publicReportViewInformePage.movementDate}>
                  {movement.dateLabel}
                </span>
              </div>
              <b
                className={cn(
                  publicReportViewInformePage.amount,
                  movement.type === "INCOME"
                    ? publicReportViewInformePage.income
                    : publicReportViewInformePage.expense,
                )}
              >
                {movement.amountLabel}
              </b>
            </li>
          ))}
        </ul>
      </BoardCard>

      <div className={publicReportViewInformePage.footer}>
        Generado con la tecnología de
        <span className={publicReportViewInformePage.footerMark} />
        <b>iEkklesia</b>
      </div>
    </div>
  );
}
