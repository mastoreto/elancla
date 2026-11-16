export type ReportCurrency = "UYU" | "USD";

export type ReportMovementType = "INCOME" | "EXPENSE";

export type GeneratedReportStatus = "READY" | "PROCESSING" | "ERROR";

export type ReportTemplate = "TREASURY" | "MINISTRY" | "EXECUTIVE";

export type ReportExportFormat = "PDF" | "CSV" | "PDF_CSV";

export type GeneratedReportsViewMode = "GRID" | "LIST";

export interface ReportFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  ministries: string[];
  projects: string[];
  currency: ReportCurrency | null;
  movementType: ReportMovementType | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  movementCount: number;
}

export interface ReportMovementRow {
  id: string;
  date: string;
  concept: string;
  type: ReportMovementType;
  ministry: string;
  project: string;
  currency: ReportCurrency;
  amount: number;
}

export interface ReportViewState {
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string | null;
}

export interface GeneratedReportListItem {
  id: string;
  name: string;
  description: string;
  status: GeneratedReportStatus;
  template: ReportTemplate;
  createdBy: string;
  createdAt: string;
  generatedAt: string;
  dateRangeLabel: string;
  ministries: string[];
  projects: string[];
  exportFormat: ReportExportFormat;
  movementCount: number;
}

export interface ReportBuilderValues {
  name: string;
  description: string;
  template: ReportTemplate;
  filters: ReportFilters;
  includeSummary: boolean;
  includeCharts: boolean;
  includeMovements: boolean;
  exportFormat: ReportExportFormat;
}

export interface ReportDetailViewData {
  id: string;
  name: string;
  description: string;
  generatedAt: string;
  createdAt: string;
  filters: ReportFilters;
  ministryOptions: string[];
  projectOptions: string[];
  summary: ReportSummary | null;
  movements: ReportMovementRow[];
}
