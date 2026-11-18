import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import type { ReportFormat, ReportKind } from "../types";

export interface ReportBuilderBlocks {
  summary: boolean;
  charts: boolean;
  movements: boolean;
}

export const REPORT_BLOCK_COUNT = 3;

/** "1 – 30 nov 2026", or the fallback while no range is picked. */
export function describeReportPeriod(range: DateRange | undefined, fallback: string): string {
  if (!range?.from) return fallback;
  const from = format(range.from, "d", { locale: es });
  if (!range.to) return format(range.from, "d MMM yyyy", { locale: es });
  return `${from} – ${format(range.to, "d MMM yyyy", { locale: es })}`;
}

export function countIncludedBlocks(blocks: ReportBuilderBlocks): number {
  return Object.values(blocks).filter(Boolean).length;
}

export function isReportKind(value: string | null | undefined): value is ReportKind {
  return value === "SUMMARY" || value === "COMPARISON" || value === "DISTRIBUTION";
}

export function canGenerateReport(name: string, blocks: ReportBuilderBlocks, fmt: ReportFormat) {
  return name.trim().length >= 3 && countIncludedBlocks(blocks) > 0 && Boolean(fmt);
}
