import type { InventoryFilters, InventoryItem } from "../types";

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = { search: "", category: "all" };

export interface InventoryValueTotals {
  usd: number;
  uyu: number;
}

/** Item values are stored as board text ("USD 1.450", "$U 96.000"). */
export function parseInventoryValue(value: string): { currency: "USD" | "UYU"; amount: number } {
  const amount = Number.parseInt(value.replace(/\D/g, ""), 10) || 0;
  return { currency: value.startsWith("USD") ? "USD" : "UYU", amount };
}

export function sumInventoryValues(items: readonly InventoryItem[]): InventoryValueTotals {
  return items.reduce<InventoryValueTotals>(
    (totals, item) => {
      const { currency, amount } = parseInventoryValue(item.value);
      return currency === "USD"
        ? { ...totals, usd: totals.usd + amount }
        : { ...totals, uyu: totals.uyu + amount };
    },
    { usd: 0, uyu: 0 },
  );
}

export function filterInventory(
  items: readonly InventoryItem[],
  { search, category }: InventoryFilters,
): InventoryItem[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== "all" && item.category !== category) {
      return false;
    }
    return (
      query === "" ||
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    );
  });
}
