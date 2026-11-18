import { DEFAULT_INVENTORY_DETAIL, inventoryDetailOverrides } from "../data/inventory-details";
import { inventoryItems } from "../data/inventory-items";
import type { InventoryFormValues, InventoryItem, InventoryItemDetail } from "../types";

export function getInventoryDetail(id: string): InventoryItemDetail | null {
  const item = inventoryItems.find((candidate) => candidate.id === id);
  if (!item) {
    return null;
  }
  return {
    ...item,
    ...DEFAULT_INVENTORY_DETAIL,
    ...inventoryDetailOverrides[id],
  };
}

export function toInventoryFormValues(
  item: InventoryItem & Partial<InventoryItemDetail>,
): InventoryFormValues {
  return {
    name: item.name,
    category: item.category,
    location: item.location,
    quantity: String(item.quantity),
    status: item.status,
    brandModel: [item.brand, item.model].filter((part) => part && part !== "—").join(" "),
    serialNumber: item.serialNumber ?? "",
    responsible: item.responsible ?? "",
    acquiredOn: item.acquiredOn ?? "",
    acquisitionMode: item.acquisitionMode ?? "Compra",
    supplier: item.supplier ?? "",
    purchaseCurrency: item.purchaseValue?.startsWith("$U") ? "UYU" : "USD",
    purchaseValue: (item.purchaseValue ?? "").replace(/[^\d]/g, ""),
    value: item.value.replace(/[^\d]/g, ""),
    notes: item.notes ?? "",
    needsMaintenance: false,
  };
}
