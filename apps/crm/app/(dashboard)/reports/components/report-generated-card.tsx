import { ArrowUpRight, CalendarDays, FileOutput, Filter, Layers3, UserRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChurchRoutePath } from "@/lib/church";

import type { GeneratedReportListItem } from "../types";
import { ReportStatusBadge } from "./report-status-badge";

interface ReportGeneratedCardProps {
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

export function ReportGeneratedCard({ report }: ReportGeneratedCardProps) {
  const canOpen = report.status === "READY";

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <ReportStatusBadge status={report.status} />
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {getTemplateLabel(report.template)}
            </Badge>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {report.movementCount} movimientos
          </Badge>
        </div>

        <div className="space-y-1">
          <CardTitle className="text-xl tracking-tight">{report.name}</CardTitle>
          <CardDescription>{report.description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Generado
            </dt>
            <dd className="mt-2 text-sm font-medium">{report.generatedAt}</dd>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <FileOutput className="size-3.5" />
              Formato
            </dt>
            <dd className="mt-2 text-sm font-medium">
              {getExportFormatLabel(report.exportFormat)}
            </dd>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <Filter className="size-3.5" />
              Período
            </dt>
            <dd className="mt-2 text-sm font-medium">{report.dateRangeLabel}</dd>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <UserRound className="size-3.5" />
              Responsable
            </dt>
            <dd className="mt-2 text-sm font-medium">{report.createdBy}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {report.ministries.length} ministerios
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {report.projects.length} proyectos
          </Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
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
      </CardContent>
    </Card>
  );
}
