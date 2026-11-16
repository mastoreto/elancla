import { ReceiptsPageContent } from "@/app/(dashboard)/receipts/components/receipts-page-content";
import type { Receipt, ReceiptRelatedOption } from "@/app/(dashboard)/receipts/types/index";

const relatedOptions: ReceiptRelatedOption[] = [
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

const initialReceipts: Receipt[] = [
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
    provider: "Casa de Audio Montevideo",
    amount: 1350,
    currency: "USD",
    date: new Date("2026-03-10T00:00:00"),
    relatedEntity: "Movimiento · Compra de insumos de sonido",
    fileUrl: "/demo/boletas/insumos-sonido.jpg",
  },
  {
    id: "receipt-3",
    number: "B-2026-00189",
    provider: "Distribuidora del Litoral",
    amount: 42_000,
    currency: "UYU",
    date: new Date("2026-03-17T00:00:00"),
    relatedEntity: "Solicitud aprobada · Jornada de acción social",
  },
];

export default function ReceiptsPage() {
  return <ReceiptsPageContent initialReceipts={initialReceipts} relatedOptions={relatedOptions} />;
}
