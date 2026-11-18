import type { InventoryHistoryEntry, InventoryItemDetail } from "../types";

type DetailOverrides = Partial<
  Pick<
    InventoryItemDetail,
    | "brand"
    | "model"
    | "serialNumber"
    | "responsible"
    | "acquiredOn"
    | "acquisitionMode"
    | "notes"
    | "history"
  >
>;

export const DEFAULT_INVENTORY_DETAIL: Required<DetailOverrides> = {
  brand: "—",
  model: "—",
  serialNumber: "—",
  responsible: "Sin asignar",
  acquiredOn: "Sin registrar",
  acquisitionMode: "Compra",
  notes: "Sin observaciones.",
  history: [],
};

const registeredHistory = (date: string): InventoryHistoryEntry => ({
  date,
  event: "Registrado",
  detail: "Alta en el inventario",
});

// Seed details from the "crm-s-inventario-detalle" board; other items fall back to defaults.
export const inventoryDetailOverrides: Record<string, DetailOverrides> = {
  "1": {
    brand: "Yamaha",
    model: "MG16XU",
    serialNumber: "YM-2291847",
    responsible: "Equipo de audio",
    acquiredOn: "12 mar 2022",
    acquisitionMode: "Compra",
    notes: "Revisión técnica anual en marzo.",
    history: [
      registeredHistory("12 mar 2022"),
      {
        date: "02 mar 2024",
        event: "Mantenimiento",
        detail: "Limpieza de faders y canales",
      },
    ],
  },
  "5": {
    brand: "Takamine",
    model: "GD30CE",
    responsible: "Ministerio de alabanza",
    acquiredOn: "05 ago 2021",
    acquisitionMode: "Donación",
    notes: "Préstamo vigente para el retiro de jóvenes.",
    history: [
      registeredHistory("05 ago 2021"),
      { date: "10 nov 2026", event: "Prestado", detail: "A Marcos Díaz hasta el 24 nov 2026" },
    ],
  },
  "6": {
    brand: "Epson",
    model: "EB-L630U",
    responsible: "Equipo de tecnología",
    acquiredOn: "20 ene 2020",
    notes: "Falla de lámpara; en reparación desde octubre.",
    history: [
      registeredHistory("20 ene 2020"),
      { date: "14 oct 2026", event: "En reparación", detail: "Enviado a servicio técnico" },
    ],
  },
};
