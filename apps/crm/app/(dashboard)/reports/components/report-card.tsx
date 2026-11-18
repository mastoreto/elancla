import { ArrowUpRight, Download } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { rowIconButtonClass } from "@/components/dashboard/board/row-icon-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS } from "../data/report-seeds";
import type { GeneratedReportListItem } from "../types";
import { REPORT_KIND_TONE, ReportKindIcon } from "./report-kind-icon";

const reportCardReportsPage = {
  header: cn("flex items-start gap-3"),
  bubble: cn("size-11"),
  icon: cn("size-5"),
  heading: cn("flex min-w-0 flex-1 flex-col gap-[3px]"),
  title: cn("font-display text-[19px] leading-tight font-medium"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
  footer: cn("mt-4 flex items-center gap-2 text-[12.5px] text-[var(--tinta-apagada)]"),
  meta: cn("flex-1"),
  smallIcon: cn("size-4"),
};

export function ReportCard({ report }: { report: GeneratedReportListItem }) {
  const ready = report.status === "READY";

  return (
    <BoardCard>
      <div className={reportCardReportsPage.header}>
        <IconBubble className={reportCardReportsPage.bubble} tone={REPORT_KIND_TONE[report.kind]}>
          <ReportKindIcon className={reportCardReportsPage.icon} kind={report.kind} />
        </IconBubble>
        <div className={reportCardReportsPage.heading}>
          <h3 className={reportCardReportsPage.title}>{report.name}</h3>
          <span className={reportCardReportsPage.subtitle}>{report.subtitle}</span>
        </div>
        <StatusPill tone={ready ? "green" : "gold"}>{ready ? "Listo" : "Generando"}</StatusPill>
      </div>
      <div className={reportCardReportsPage.footer}>
        <span className={reportCardReportsPage.meta}>
          {FORMAT_LABELS[report.format]} · {report.generatedLabel}
        </span>
        <BoardButton href={getChurchRoutePath("reports", report.id)} size="sm" variant="soft">
          <ArrowUpRight aria-hidden="true" className={reportCardReportsPage.smallIcon} />
          Abrir
        </BoardButton>
        <button
          aria-label={`Descargar ${report.name}`}
          className={rowIconButtonClass}
          disabled={!ready}
          type="button"
        >
          <Download aria-hidden="true" className={reportCardReportsPage.smallIcon} />
        </button>
      </div>
    </BoardCard>
  );
}
