import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";

import type { ReportFilters } from "../types/index";
import { ReportScopeFields } from "./report-scope-fields";
import { ReportSectionShell } from "./report-section-shell";

interface ReportFiltersPanelProps {
  filters: ReportFilters;
  ministryOptions: string[];
  projectOptions: string[];
  onFiltersChange: (filters: ReportFilters) => void;
  onGenerateReport?: () => void;
  onClearFilters?: () => void;
  showDateRangeError?: boolean;
}

export function ReportFiltersPanel({
  filters,
  ministryOptions,
  projectOptions,
  onFiltersChange,
  onGenerateReport,
  onClearFilters,
  showDateRangeError = false,
}: ReportFiltersPanelProps) {
  return (
    <ReportSectionShell
      title="Filtros del reporte"
      description="Ajusta el período, la moneda y la segmentación antes de generar el reporte."
    >
      <FieldSet className="gap-5">
        <ReportScopeFields
          filters={filters}
          ministryOptions={ministryOptions}
          projectOptions={projectOptions}
          onFiltersChange={onFiltersChange}
          showDateRangeError={showDateRangeError}
        />

        <div className="flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" onClick={onClearFilters}>
            <RotateCcw className="size-4" />
            Limpiar filtros
          </Button>
          <Button type="button" onClick={onGenerateReport}>
            <Search className="size-4" />
            Generar reporte
          </Button>
        </div>
      </FieldSet>
    </ReportSectionShell>
  );
}
