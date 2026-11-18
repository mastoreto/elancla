export type InventoryCategory = "Sonido" | "Instrumentos" | "Mobiliario" | "Tecnología" | "Cocina";

export type InventoryStatus = "Bueno" | "Regular" | "Prestado" | "En reparación" | "Dado de baja";

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: InventoryCategory;
  location: string;
  quantity: number;
  status: InventoryStatus;
  value: string;
  /** Short return date ("30 nov") while the item is on loan. */
  loanReturnOn?: string;
}

export type InventoryHistoryKind = "created" | "edit" | "status" | "loan" | "repair";

export interface InventoryHistoryEntry {
  kind: InventoryHistoryKind;
  date: string;
  event: string;
  detail: string;
}

export interface InventoryItemDetail extends InventoryItem {
  brand: string;
  model: string;
  serialNumber: string;
  responsible: string;
  acquiredOn: string;
  acquisitionMode: string;
  supplier: string;
  purchaseValue: string;
  warranty: string;
  invoiceFile: string;
  notes: string;
  history: InventoryHistoryEntry[];
}

export interface InventoryFormValues {
  name: string;
  category: InventoryCategory | "";
  location: string;
  quantity: string;
  status: InventoryStatus;
  brandModel: string;
  serialNumber: string;
  responsible: string;
  acquiredOn: string;
  acquisitionMode: string;
  supplier: string;
  purchaseCurrency: "UYU" | "USD";
  purchaseValue: string;
  value: string;
  notes: string;
  needsMaintenance: boolean;
}

export type InventoryViewMode = "table" | "grid";

export type InventoryCategoryFilter = InventoryCategory | "all";

export interface InventoryFilters {
  search: string;
  category: InventoryCategoryFilter;
}
