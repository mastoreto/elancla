import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  },
  approved: {
    label: "Aprobada",
    className: "bg-income/20 text-income dark:bg-income/30",
  },
  rejected: {
    label: "Rechazada",
    className: "bg-expense/20 text-expense dark:bg-expense/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
