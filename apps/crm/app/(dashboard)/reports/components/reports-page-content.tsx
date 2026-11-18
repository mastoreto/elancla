import { ArrowLeft, BadgeDollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { DashboardPageHeader } from "@/src/componentes/dashboard";

import type { ReportFilters, ReportMovementRow, ReportSummary, ReportViewState } from "../types";
import { ReportChartsSection } from "./report-charts-section";
import { ReportExportActions } from "./report-export-actions";
import { ReportFiltersPanel } from "./report-filters-panel";
import { ReportMovementsTable } from "./report-movements-table";
import { ReportSummaryCards } from "./report-summary-cards";
import { cn } from "@/lib/utils";

const reportsPageContentReportsPage = {
  note: cn("rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-xs"),
  noteTitle: cn("flex items-center gap-2 text-sm font-medium"),
};

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
      <DashboardPageHeader
        actions={
          <Button asChild={true} className="rounded-full" type="button" variant="outline">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        }
        description={`${reportDescription} Generado ${generatedAtLabel}${createdAtLabel ? `, creado ${createdAtLabel}` : ""}. ${summary?.movementCount ?? movements.length} movimientos en ${visibleCurrency}, ${filters.ministries.length > 0 ? filters.ministries.length : "todos los"} ministerios.`}
        kicker={headerBadge}
        title={reportName}
      />

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
        <div className={reportsPageContentReportsPage.note}>
          <div className={reportsPageContentReportsPage.noteTitle}>
            <BarChart3 className="size-4 text-accent" />
            Visualizaciones
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Resumen visual del reporte generado.</p>
        </div>
        <div className={reportsPageContentReportsPage.note}>
          <div className={reportsPageContentReportsPage.noteTitle}>
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
