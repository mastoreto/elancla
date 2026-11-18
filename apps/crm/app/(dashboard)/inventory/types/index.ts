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
}

export interface InventoryHistoryEntry {
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
  notes: string;
  history: InventoryHistoryEntry[];
}

export interface InventoryFormValues {
  name: string;
  category: InventoryCategory | "";
  location: string;
  quantity: string;
  status: InventoryStatus;
  brand: string;
  model: string;
  serialNumber: string;
  responsible: string;
  acquiredOn: string;
  acquisitionMode: string;
  value: string;
  notes: string;
}
