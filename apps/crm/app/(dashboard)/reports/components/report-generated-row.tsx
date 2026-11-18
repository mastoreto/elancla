import { ArrowUpRight, CalendarDays, FileOutput, Filter, Layers3, UserRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

import type { GeneratedReportListItem } from "../types";
import { ReportStatusBadge } from "./report-status-badge";

const reportGeneratedRowReportsPage = {
  projectBadge: cn("rounded-full px-3 py-1"),
  row: cn(
    "rounded-2xl border border-border/60 bg-background/80 px-4 py-4 transition-colors hover:border-border md:px-5",
  ),
  layout: cn("flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"),
  facts: cn("grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4"),
  fact: cn("flex items-center gap-2 text-muted-foreground"),
};

interface ReportGeneratedRowProps {
  report: GeneratedReportListItem;
}

function getTemplateLabel(template: GeneratedReportListItem["template"]) {
  switch (template) {
    case "TREASURY":
      return "Tesorería";
    case "MINISTRY":
      return "Ministerio";
    case "EXECUTIVE":
      return "Ejecutivo";
    default:
      return template;
  }
}

function getExportFormatLabel(exportFormat: GeneratedReportListItem["exportFormat"]) {
  switch (exportFormat) {
    case "PDF":
      return "PDF";
    case "CSV":
      return "CSV";
    case "PDF_CSV":
      return "PDF y CSV";
    default:
      return exportFormat;
  }
}

export function ReportGeneratedRow({ report }: ReportGeneratedRowProps) {
  const canOpen = report.status === "READY";

  return (
    <article className={reportGeneratedRowReportsPage.row}>
      <div className={reportGeneratedRowReportsPage.layout}>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge status={report.status} />
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {getTemplateLabel(report.template)}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {report.movementCount} movimientos
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">{report.name}</h3>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </div>

          <dl className={reportGeneratedRowReportsPage.facts}>
            <div className={reportGeneratedRowReportsPage.fact}>
              <CalendarDays className="size-4 text-accent" />
              <div>
                <dt className="sr-only">Generado</dt>
                <dd>{report.generatedAt}</dd>
              </div>
            </div>

            <div className={reportGeneratedRowReportsPage.fact}>
              <FileOutput className="size-4 text-accent" />
              <div>
                <dt className="sr-only">Formato</dt>
                <dd>{getExportFormatLabel(report.exportFormat)}</dd>
              </div>
            </div>

            <div className={reportGeneratedRowReportsPage.fact}>
              <Filter className="size-4 text-accent" />
              <div>
                <dt className="sr-only">Período</dt>
                <dd>{report.dateRangeLabel}</dd>
              </div>
            </div>

            <div className={reportGeneratedRowReportsPage.fact}>
              <UserRound className="size-4 text-accent" />
              <div>
                <dt className="sr-only">Responsable</dt>
                <dd>{report.createdBy}</dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full px-3 py-1",
                report.ministries.length === 0 && "opacity-70",
              )}
            >
              {report.ministries.length} ministerios
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                reportGeneratedRowReportsPage.projectBadge,
                report.projects.length === 0 && "opacity-70",
              )}
            >
              {report.projects.length} proyectos
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:w-48">
          {canOpen ? (
            <Button type="button" asChild={true}>
              <Link href={getChurchRoutePath("reports", report.id)}>
                Ver reporte
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button type="button" disabled={true}>
              Ver reporte
            </Button>
          )}

          <Button type="button" variant="outline" asChild={true}>
            <Link href={getChurchRoutePath("reports", "new")}>
              <Layers3 className="size-4" />
              Nuevo reporte
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
