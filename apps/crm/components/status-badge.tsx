import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusBadgeRequestsPageStatus = {
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
} satisfies Record<RequestStatus, { label: string; className: string }>;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusBadgeRequestsPageStatus[status];
  const statusBadgeRequestsPage = {
    badge: cn("rounded-full border-0", config.className, className),
  };

  return (
    <Badge variant="secondary" className={statusBadgeRequestsPage.badge}>
      {config.label}
    </Badge>
  );
}
