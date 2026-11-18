import type { Receipt, ReceiptRelatedOption } from "../types";

export const relatedOptions: ReceiptRelatedOption[] = [
  {
    value: "movement-renta-marzo",
    label: "Pago de renta marzo",
    category: "Movimiento",
  },
  {
    value: "movement-sonido",
    label: "Compra de insumos de sonido",
    category: "Movimiento",
  },
  {
    value: "request-campamento",
    label: "Campamento de verano",
    category: "Solicitud",
  },
  {
    value: "request-accion-social",
    label: "Jornada de acción social",
    category: "Solicitud",
  },
];

export const initialReceipts: Receipt[] = [
  {
    id: "receipt-1",
    number: "B-2026-00124",
    provider: "Servicios Integrales del Sur",
    amount: 18_250,
    currency: "UYU",
    date: new Date("2026-03-04T00:00:00"),
    relatedEntity: "Movimiento · Pago de renta marzo",
    fileUrl: "/demo/boletas/boleta-renta-marzo.pdf",
  },
  {
    id: "receipt-2",
    number: "B-2026-00161",
    provider: "Sonido Montevideo",
    amount: 32_400,
    currency: "UYU",
    date: new Date("2026-03-09T00:00:00"),
    relatedEntity: "Movimiento · Insumos de sonido",
    fileUrl: "/demo/boletas/insumos-sonido.jpg",
  },
  {
    id: "receipt-3",
    number: "B-2026-00188",
    provider: "Papelería Central",
    amount: 2800,
    currency: "UYU",
    date: new Date("2026-03-15T00:00:00"),
    relatedEntity: "Solicitud · Campamento de verano",
  },
  {
    id: "receipt-4",
    number: "B-2026-00203",
    provider: "Supermercado Tienda Inglesa",
    amount: 12_900,
    currency: "UYU",
    date: new Date("2026-03-18T00:00:00"),
    relatedEntity: "Solicitud · Jornada de acción social",
  },
];
