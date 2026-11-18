import { ArrowLeft, BadgeDollarSign, BarChart3, CalendarDays, ReceiptText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";

import type { ReportFilters, ReportMovementRow, ReportSummary, ReportViewState } from "../types";
import { ReportChartsSection } from "./report-charts-section";
import { ReportExportActions } from "./report-export-actions";
import { ReportFiltersPanel } from "./report-filters-panel";
import { ReportMovementsTable } from "./report-movements-table";
import { ReportSummaryCards } from "./report-summary-cards";

interface ReportsPageContentProps {
  reportName: string;
  reportDescription: string;
  generatedAtLabel: string;
  createdAtLabel?: string;
  filters: ReportFilters;
  ministryOptions: string[];
  projectOptions: string[];
  summary: ReportSummary | null;
  movements: ReportMovementRow[];
  onFiltersChange: (filters: ReportFilters) => void;
  onGenerateReport?: () => void;
  onClearFilters?: () => void;
  showDateRangeError?: boolean;
  summaryState?: ReportViewState;
  chartsState?: ReportViewState;
  movementsState?: ReportViewState;
  exportDisabled?: boolean;
  backHref?: string;
  backLabel?: string;
  headerBadge?: string;
}

export function ReportsPageContent({
  reportName,
  reportDescription,
  generatedAtLabel,
  createdAtLabel,
  filters,
  ministryOptions,
  projectOptions,
  summary,
  movements,
  onFiltersChange,
  onGenerateReport,
  onClearFilters,
  showDateRangeError = false,
  summaryState,
  chartsState,
  movementsState,
  exportDisabled,
  backHref = getChurchRoutePath("reports"),
  backLabel = "Volver al listado",
  headerBadge = "Reporte generado",
}: ReportsPageContentProps) {
  const visibleCurrency = filters.currency ?? "UYU";
  const visibleMovements = movementsState?.isEmpty ? [] : movements;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 px-6 py-7 shadow-sm md:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(92,180,160,0.18),transparent_65%)] lg:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild={true}>
                <Link href={backHref}>
                  <ArrowLeft className="size-4" />
                  {backLabel}
                </Link>
              </Button>
              <Badge className="rounded-full bg-accent/10 px-3 py-1 text-accent hover:bg-accent/10">
                {headerBadge}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Vista detallada
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{reportName}</h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                {reportDescription}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="size-4 text-accent" />
                Generado
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{generatedAtLabel}</p>
              {createdAtLabel ? (
                <p className="mt-1 text-xs text-muted-foreground">Creado: {createdAtLabel}</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ReceiptText className="size-4 text-income" />
                Alcance
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary?.movementCount ?? movements.length} movimientos en {visibleCurrency}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filters.ministries.length > 0 ? filters.ministries.length : "Todos"} ministerios
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReportFiltersPanel
        filters={filters}
        ministryOptions={ministryOptions}
        projectOptions={projectOptions}
        onFiltersChange={onFiltersChange}
        onGenerateReport={onGenerateReport}
        onClearFilters={onClearFilters}
        showDateRangeError={showDateRangeError}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="size-4 text-accent" />
            Visualizaciones
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Resumen visual del reporte generado.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BadgeDollarSign className="size-4 text-income" />
            Exportables
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Acciones listas para PDF y CSV según disponibilidad.
          </p>
        </div>
      </div>

      <ReportSummaryCards
        summary={summary}
        currency={visibleCurrency}
        isLoading={summaryState?.isLoading}
        isEmpty={summaryState?.isEmpty}
        errorMessage={summaryState?.errorMessage}
      />

      <ReportChartsSection
        isLoading={chartsState?.isLoading}
        isEmpty={chartsState?.isEmpty}
        errorMessage={chartsState?.errorMessage}
      />

      <ReportMovementsTable
        movements={visibleMovements}
        isLoading={movementsState?.isLoading}
        errorMessage={movementsState?.errorMessage}
      />

      <ReportExportActions disabled={exportDisabled ?? visibleMovements.length === 0} />
    </div>
  );
}
