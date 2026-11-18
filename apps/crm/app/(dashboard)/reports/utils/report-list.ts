import type { GeneratedReportListItem } from "../types";

export type ReportsTab = "generated" | "pending" | "catalog";

export interface ReportListFilters {
  search: string;
  tab: Exclude<ReportsTab, "catalog">;
}

export function countReportsByTab(reports: GeneratedReportListItem[], catalogSize: number) {
  return {
    generated: reports.length,
    pending: reports.filter((report) => report.status === "PROCESSING").length,
    catalog: catalogSize,
  } satisfies Record<ReportsTab, number>;
}

export function filterReports(
  reports: GeneratedReportListItem[],
  { search, tab }: ReportListFilters,
): GeneratedReportListItem[] {
  const query = search.trim().toLowerCase();

  return reports.filter((report) => {
    if (tab === "pending" && report.status !== "PROCESSING") return false;
    if (!query) return true;
    return `${report.name} ${report.subtitle}`.toLowerCase().includes(query);
  });
}
