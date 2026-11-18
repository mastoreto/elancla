import { AlertCircle, CalendarRange, Files, FolderTree, Layers3 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { ReportBuilderValues } from "../types/index";
import { ReportSectionShell } from "./report-section-shell";

interface ReportCreationSummaryProps {
  values: ReportBuilderValues;
  showDateRangeError?: boolean;
}

function getTemplateLabel(template: ReportBuilderValues["template"]) {
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

function getExportFormatLabel(exportFormat: ReportBuilderValues["exportFormat"]) {
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDateRangeLabel(values: ReportBuilderValues) {
  if (!values.filters.dateFrom || !values.filters.dateTo) {
    return "Selecciona un rango de fechas";
  }

  return `${formatDate(values.filters.dateFrom)} - ${formatDate(values.filters.dateTo)}`;
}

function getIncludedBlocks(values: ReportBuilderValues) {
  const blocks: string[] = [];

  if (values.includeSummary) {
    blocks.push("Resumen general");
  }

  if (values.includeCharts) {
    blocks.push("Visualizaciones");
  }

  if (values.includeMovements) {
    blocks.push("Tabla de movimientos");
  }

  return blocks;
}

export function ReportCreationSummary({
  values,
  showDateRangeError = false,
}: ReportCreationSummaryProps) {
  const includedBlocks = getIncludedBlocks(values);

  return (
    <ReportSectionShell
      title="Resumen del borrador"
      description="Vista rápida de cómo quedará configurado el nuevo reporte."
    >
      <div className="space-y-5">
        {showDateRangeError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Rango incompleto</AlertTitle>
            <AlertDescription>Debes seleccionar un rango de fechas</AlertDescription>
          </Alert>
        ) : null}

        <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Nombre del reporte
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            {values.name || "Sin nombre definido"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {values.description || "Agrega una descripción breve para contextualizar este reporte."}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers3 className="size-4 text-accent" />
              Plantilla
            </div>
            <span className="text-sm text-muted-foreground">
              {getTemplateLabel(values.template)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarRange className="size-4 text-accent" />
              Período
            </div>
            <span className="text-right text-sm text-muted-foreground">
              {getDateRangeLabel(values)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderTree className="size-4 text-accent" />
              Cobertura
            </div>
            <span className="text-right text-sm text-muted-foreground">
              {values.filters.ministries.length} ministerios · {values.filters.projects.length}{" "}
              proyectos
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Files className="size-4 text-accent" />
              Exportación
            </div>
            <span className="text-sm text-muted-foreground">
              {getExportFormatLabel(values.exportFormat)}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">Bloques incluidos</p>
          <div className="flex flex-wrap gap-2">
            {includedBlocks.length > 0 ? (
              includedBlocks.map((block) => (
                <Badge key={block} variant="secondary" className="rounded-full px-3 py-1">
                  {block}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Sin bloques seleccionados
              </Badge>
            )}
          </div>
        </div>
      </div>
    </ReportSectionShell>
  );
}
