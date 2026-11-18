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
    className: "bg-warning-surface text-warning",
  },
  approved: {
    label: "Aprobada",
    className: "bg-income/20 text-income",
  },
  rejected: {
    label: "Rechazada",
    className: "bg-expense/20 text-expense",
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
