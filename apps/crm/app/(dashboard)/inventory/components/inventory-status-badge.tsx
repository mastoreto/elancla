import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { InventoryStatus } from "../types";
import { INVENTORY_STATUS_TONE } from "../utils";

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  className?: string;
}

export function InventoryStatusBadge({ status, className }: InventoryStatusBadgeProps) {
  return (
    <StatusPill className={className} tone={INVENTORY_STATUS_TONE[status]}>
      {status}
    </StatusPill>
  );
}
