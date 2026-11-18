import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InventoryStatus } from "../types";

const statusClassNames: Record<InventoryStatus, string> = {
  Bueno: "bg-success-surface text-income",
  Regular: "bg-warning-surface text-warning",
  Prestado: "bg-secondary text-secondary-foreground",
  "En reparación": "bg-accent text-accent-foreground",
  "Dado de baja": "bg-muted text-muted-foreground",
};

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
}

export function InventoryStatusBadge({ status }: InventoryStatusBadgeProps) {
  return (
    <Badge className={cn("rounded-full border-0", statusClassNames[status])} variant="secondary">
      {status}
    </Badge>
  );
}
