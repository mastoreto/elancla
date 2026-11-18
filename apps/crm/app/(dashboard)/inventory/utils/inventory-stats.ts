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

/** "Guitarra · devuelve el 30 nov" for the first item currently on loan. */
export function describeLoans(items: readonly InventoryItem[]): string {
  const loaned = items.find((item) => item.status === "Prestado");
  if (!loaned) {
    return "Nada pendiente de devolución";
  }
  const [firstWord] = loaned.name.split(" ");
  return loaned.loanReturnOn
    ? `${firstWord} · devuelve el ${loaned.loanReturnOn}`
    : `${firstWord} · pendiente de devolución`;
}

export function describeAttention(items: readonly InventoryItem[]): string {
  const repairing = countByStatus(items, "En reparación");
  const regular = countByStatus(items, "Regular");
  const parts = [
    repairing > 0 ? `${repairing} en reparación` : null,
    regular > 0 ? `${regular} regular${regular === 1 ? "" : "es"}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Todo en buen estado";
}
