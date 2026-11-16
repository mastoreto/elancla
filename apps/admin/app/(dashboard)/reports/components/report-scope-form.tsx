import type { ReportFilters } from "../types/index";
import { ReportScopeFields } from "./report-scope-fields";
import { ReportSectionShell } from "./report-section-shell";

interface ReportScopeFormProps {
  filters: ReportFilters;
  ministryOptions: string[];
  projectOptions: string[];
  onFiltersChange: (filters: ReportFilters) => void;
  showDateRangeError?: boolean;
}

export function ReportScopeForm({
  filters,
  ministryOptions,
  projectOptions,
  onFiltersChange,
  showDateRangeError = false,
}: ReportScopeFormProps) {
  return (
    <ReportSectionShell
      title="Alcance del reporte"
      description="Define el período, la segmentación y el rango de montos que formarán parte del reporte."
    >
      <ReportScopeFields
        filters={filters}
        ministryOptions={ministryOptions}
        projectOptions={projectOptions}
        onFiltersChange={onFiltersChange}
        showDateRangeError={showDateRangeError}
      />
    </ReportSectionShell>
  );
}
