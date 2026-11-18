import type { InventoryItem, InventoryStatus } from "../types";

const ATTENTION_STATUSES: readonly InventoryStatus[] = ["Regular", "En reparación"];

export function getTotalUnits(items: readonly InventoryItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function countByStatus(items: readonly InventoryItem[], status: InventoryStatus): number {
  return items.filter((item) => item.status === status).length;
}

export function countNeedingAttention(items: readonly InventoryItem[]): number {
  return items.filter((item) => ATTENTION_STATUSES.includes(item.status)).length;
}
