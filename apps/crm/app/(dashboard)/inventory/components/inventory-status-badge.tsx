import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InventoryStatus } from "../types";

const inventoryStatusBadgeInventoryPageStatus = {
  Bueno: "bg-success-surface text-income",
  Regular: "bg-warning-surface text-warning",
  Prestado: "bg-secondary text-secondary-foreground",
  "En reparación": "bg-accent text-accent-foreground",
  "Dado de baja": "bg-muted text-muted-foreground",
} satisfies Record<InventoryStatus, string>;

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  className?: string;
}

export function InventoryStatusBadge({ status, className }: InventoryStatusBadgeProps) {
  const inventoryStatusBadgeInventoryPage = {
    badge: cn("rounded-full border-0", inventoryStatusBadgeInventoryPageStatus[status], className),
  };

  return (
    <Badge className={inventoryStatusBadgeInventoryPage.badge} variant="secondary">
      {status}
    </Badge>
  );
}
