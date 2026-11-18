import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssemblyReportStatus } from "../types";

const statusClassNames: Record<AssemblyReportStatus, string> = {
  Abierto: "bg-success-surface text-income",
  Programado: "bg-warning-surface text-warning",
  "Sin habilitar": "bg-secondary text-secondary-foreground",
  Vencido: "bg-muted text-muted-foreground",
  "Dado de baja": "bg-accent text-accent-foreground",
};

interface AssemblyStatusBadgeProps {
  status: AssemblyReportStatus;
}

export function AssemblyStatusBadge({ status }: AssemblyStatusBadgeProps) {
  return (
    <Badge className={cn("rounded-full border-0", statusClassNames[status])} variant="secondary">
      {status}
    </Badge>
  );
}
