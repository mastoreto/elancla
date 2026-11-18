import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { GeneratedReportStatus } from "../types/index";

const reportStatusBadgeReportsPage = {
  ready: cn("border-income/30 bg-income/10 text-income"),
  failed: cn("border-expense/30 bg-expense/10 text-expense"),
};

interface ReportStatusBadgeProps {
  status: GeneratedReportStatus;
}

const statusConfig = {
  READY: {
    label: "Listo",
    className: reportStatusBadgeReportsPage.ready,
  },
  PROCESSING: {
    label: "En generación",
    className: "border-oro/30 bg-oro/10 text-warning",
  },
  ERROR: {
    label: "Con errores",
    className: reportStatusBadgeReportsPage.failed,
  },
} as const;

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1", statusConfig[status].className)}
    >
      {statusConfig[status].label}
    </Badge>
  );
}
