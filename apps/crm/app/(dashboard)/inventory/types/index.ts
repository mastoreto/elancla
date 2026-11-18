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
