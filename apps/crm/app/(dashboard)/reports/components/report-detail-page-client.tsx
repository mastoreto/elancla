"use client";

import { useState } from "react";

import type { ReportDetailViewData, ReportFilters } from "../types/index";
import { ReportsPageContent } from "./reports-page-content";

interface ReportDetailPageClientProps {
  report: ReportDetailViewData;
}

function cloneFilters(filters: ReportFilters): ReportFilters {
  return {
    ...filters,
    ministries: [...filters.ministries],
    projects: [...filters.projects],
  };
}

export function ReportDetailPageClient({ report }: ReportDetailPageClientProps) {
  const [filters, setFilters] = useState<ReportFilters>(() => cloneFilters(report.filters));

  const handleClearFilters = () => {
    setFilters(cloneFilters(report.filters));
  };

  return (
    <ReportsPageContent
      reportName={report.name}
      reportDescription={report.description}
      generatedAtLabel={report.generatedAt}
      createdAtLabel={report.createdAt}
      filters={filters}
      ministryOptions={report.ministryOptions}
      projectOptions={report.projectOptions}
      summary={report.summary}
      movements={report.movements}
      onFiltersChange={setFilters}
      onClearFilters={handleClearFilters}
      exportDisabled={report.movements.length === 0}
    />
  );
}
