import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssemblyReportStatus } from "../types";

const assemblyStatusBadgeAssemblyPageStatus = {
  Abierto: "bg-success-surface text-income",
  Programado: "bg-warning-surface text-warning",
  "Sin habilitar": "bg-secondary text-secondary-foreground",
  Vencido: "bg-muted text-muted-foreground",
  "Dado de baja": "bg-accent text-accent-foreground",
} satisfies Record<AssemblyReportStatus, string>;

interface AssemblyStatusBadgeProps {
  status: AssemblyReportStatus;
  className?: string;
}

export function AssemblyStatusBadge({ status, className }: AssemblyStatusBadgeProps) {
  const assemblyStatusBadgeAssemblyPage = {
    badge: cn("rounded-full border-0", assemblyStatusBadgeAssemblyPageStatus[status], className),
  };

  return (
    <Badge className={assemblyStatusBadgeAssemblyPage.badge} variant="secondary">
      {status}
    </Badge>
  );
}
