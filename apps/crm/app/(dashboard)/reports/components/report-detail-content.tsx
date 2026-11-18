import { CircleCheck, Download } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS } from "../data/report-seeds";
import type { ReportDetailViewData } from "../types";
import { ReportBarChart } from "./report-bar-chart";
import { ReportMovementsTable } from "./report-movements-table";
import { ReportShareDonut } from "./report-share-donut";

const reportDetailContentReportsPage = {
  page: cn("flex flex-col gap-5"),
  title: cn("flex flex-wrap items-center gap-3"),
  name: cn("font-display text-[26px] leading-tight font-medium"),
  titleSpacer: cn("flex-1"),
  bar: cn(
    "flex flex-wrap items-center gap-3 rounded-[26px] bg-secondary px-5 py-4",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
  ),
  barText: cn("min-w-60 flex-1 text-sm text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
  charts: cn("grid grid-cols-1 gap-[18px] lg:grid-cols-[1.3fr_1fr]"),
};

export function ReportDetailContent({ detail }: { detail: ReportDetailViewData }) {
  const { report, kpis } = detail;
  const ready = report.status === "READY";

  return (
    <div className={reportDetailContentReportsPage.page}>
      <div className={reportDetailContentReportsPage.title}>
        <h2 className={reportDetailContentReportsPage.name}>{report.name}</h2>
        <StatusPill tone={ready ? "green" : "gold"}>{ready ? "Listo" : "Generando"}</StatusPill>
      </div>

      <div className={reportDetailContentReportsPage.bar}>
        <span className={reportDetailContentReportsPage.barText}>
          {report.generatedLabel} por {detail.generatedBy} · Formato {FORMAT_LABELS[report.format]}
        </span>
        <BoardButton disabled={!ready} variant="outline">
          <Download aria-hidden="true" className={reportDetailContentReportsPage.icon} />
          Descargar CSV
        </BoardButton>
        <BoardButton disabled={!ready} variant="outline">
          <Download aria-hidden="true" className={reportDetailContentReportsPage.icon} />
          Descargar PDF
        </BoardButton>
        <BoardButton disabled={!ready} variant="primary">
          <CircleCheck aria-hidden="true" className={reportDetailContentReportsPage.icon} />
          Publicar en asamblea
        </BoardButton>
      </div>

      <StatCardGrid>
        {kpis.map((kpi) => (
          <StatCard
            detail={kpi.detail}
            highlighted={kpi.label === "Balance"}
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
          />
        ))}
      </StatCardGrid>

      <div className={reportDetailContentReportsPage.charts}>
        <BoardCard>
          <BoardCardHeader
            subtitle="Bloque visual de comparación mensual"
            title="Ingresos vs egresos"
          />
          <ReportBarChart months={detail.months} />
        </BoardCard>
        <BoardCard>
          <BoardCardHeader
            subtitle="Bloque visual para distribución porcentual"
            title="Distribución por ministerio"
          />
          <ReportShareDonut shares={detail.shares} />
        </BoardCard>
      </div>

      <ReportMovementsTable movements={detail.movements} total={detail.movementTotal} />
    </div>
  );
}
