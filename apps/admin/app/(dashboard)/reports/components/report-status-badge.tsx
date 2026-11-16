import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { GeneratedReportStatus } from "../types/index";

interface ReportStatusBadgeProps {
  status: GeneratedReportStatus;
}

const statusConfig = {
  READY: {
    label: "Listo",
    className: "border-income/30 bg-income/10 text-income",
  },
  PROCESSING: {
    label: "En generación",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ERROR: {
    label: "Con errores",
    className: "border-expense/30 bg-expense/10 text-expense",
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
