import { VouchersPageContent } from "@/app/(dashboard)/vouchers/components/vouchers-page-content";
import type { Voucher, VoucherRelatedOption } from "@/app/(dashboard)/vouchers/types";

const relatedOptions: VoucherRelatedOption[] = [
  {
    value: "movement-refrigerios",
    label: "Compra de refrigerios para reunión general",
    kind: "movement",
  },
  {
    value: "movement-transporte",
    label: "Pago de transporte local",
    kind: "movement",
  },
  {
    value: "request-visita-social",
    label: "Visita social a familias",
    kind: "request",
  },
  {
    value: "request-capacitacion",
    label: "Capacitación de líderes",
    kind: "request",
  },
];

const initialVouchers: Voucher[] = [
  {
    id: "voucher-1",
    description: "Compra urgente de refrigerios para encuentro de voluntarios",
    amount: 12_800,
    currency: "UYU",
    date: new Date("2026-03-08T00:00:00"),
    responsible: "María González",
    relatedEntity: "Movimiento · Compra de refrigerios para reunión general",
    justification:
      "El proveedor no emitió boleta en el momento de la compra y fue necesario resolver el gasto de forma inmediata para el evento.",
  },
  {
    id: "voucher-2",
    description: "Traslado interno para visita pastoral",
    amount: 220,
    currency: "USD",
    date: new Date("2026-03-13T00:00:00"),
    responsible: "Juan Pereira",
    relatedEntity: "Solicitud · Visita social a familias",
    justification:
      "El servicio de transporte fue informal y no entregó documentación fiscal, por lo que se registró el comprobante manual correspondiente.",
  },
  {
    id: "voucher-3",
    description: "Compra menor de insumos para capacitación",
    amount: 5400,
    currency: "UYU",
    date: new Date("2026-03-19T00:00:00"),
    responsible: "Lucía Martínez",
    relatedEntity: "Solicitud · Capacitación de líderes",
  },
];

export default function VouchersPage() {
  return <VouchersPageContent initialVouchers={initialVouchers} relatedOptions={relatedOptions} />;
}
