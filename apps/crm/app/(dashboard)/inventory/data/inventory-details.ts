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
    | "supplier"
    | "purchaseValue"
    | "warranty"
    | "invoiceFile"
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
  supplier: "—",
  purchaseValue: "—",
  warranty: "Sin garantía registrada",
  invoiceFile: "",
  notes: "Sin observaciones.",
  history: [],
};

const registeredHistory = (
  date: string,
  detail = "Alta en el inventario",
): InventoryHistoryEntry => ({
  kind: "created",
  date,
  event: "Ítem registrado",
  detail,
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
        kind: "edit",
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
      {
        kind: "loan",
        date: "10 nov 2026",
        event: "Prestado",
        detail: "A Marcos Díaz hasta el 24 nov 2026",
      },
    ],
  },
  "6": {
    brand: "Epson",
    model: "EB-L630U",
    serialNumber: "X4RK-228190",
    responsible: "Equipo de medios",
    acquiredOn: "12 mar 2022",
    supplier: "Electro Sur",
    purchaseValue: "USD 1.100",
    warranty: "Vencida el 12 mar 2025",
    invoiceFile: "Factura-0482.pdf",
    notes: "Lámpara quemada, enviado a reparación.",
    history: [
      registeredHistory("12 mar 2022", "Por María García"),
      {
        kind: "edit",
        date: "3 ago",
        event: "Ubicación actualizada",
        detail: "Sala de audio → Templo · fondo",
      },
      {
        kind: "status",
        date: "12 nov",
        event: "Estado: Bueno → Regular",
        detail: "Imagen amarillenta",
      },
      {
        kind: "repair",
        date: "hoy",
        event: "Enviado a reparación",
        detail: "Lámpara quemada · Técnico Soluciones AV",
      },
    ],
  },
};
