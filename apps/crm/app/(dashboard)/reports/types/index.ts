export type ReportStatus = "READY" | "PROCESSING";

export type ReportKind = "SUMMARY" | "COMPARISON" | "DISTRIBUTION" | "DETAIL";

export type ReportFormat = "PDF" | "CSV" | "PDF_CSV";

export type ReportMovementType = "INCOME" | "EXPENSE";

export interface GeneratedReportListItem {
  id: string;
  name: string;
  /** "Ejecutivo · 1 – 31 oct": template and period shown under the name. */
  subtitle: string;
  kind: ReportKind;
  status: ReportStatus;
  format: ReportFormat;
  /** "Generado hoy 09:12", or "Generando…". */
  generatedLabel: string;
}

export interface ReportTemplateItem {
  kind: ReportKind;
  name: string;
  description: string;
  /** Short line used by the creation form. */
  hint: string;
}

export interface ReportKpi {
  label: string;
  value: string;
  detail: string;
}

export interface ReportMonthBar {
  month: string;
  income: number;
  expense: number;
}

export interface ReportMinistryShare {
  label: string;
  percent: number;
}

export interface ReportMovementRow {
  id: string;
  dateLabel: string;
  concept: string;
  note: string;
  type: ReportMovementType;
  project: string;
  /** Already formatted with sign and currency, e.g. "+ $U 45.000". */
  amountLabel: string;
}

export interface ReportDetailViewData {
  report: GeneratedReportListItem;
  generatedBy: string;
  kpis: [ReportKpi, ReportKpi, ReportKpi, ReportKpi];
  months: ReportMonthBar[];
  shares: ReportMinistryShare[];
  movements: ReportMovementRow[];
  movementTotal: number;
}
