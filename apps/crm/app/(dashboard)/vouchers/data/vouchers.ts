import type { Voucher, VoucherRelatedOption } from "../types";

export const relatedOptions: VoucherRelatedOption[] = [
  {
    value: "movement-refrigerios",
    label: "Refrigerios",
    kind: "movement",
  },
  {
    value: "movement-mantenimiento",
    label: "Mantenimiento",
    kind: "movement",
  },
  {
    value: "request-visita-social",
    label: "Visita social",
    kind: "request",
  },
  {
    value: "request-capacitacion",
    label: "Capacitación de líderes",
    kind: "request",
  },
];

export const initialVouchers: Voucher[] = [
  {
    id: "voucher-1",
    description: "Refrigerios para encuentro de voluntarios",
    amount: 12_800,
    currency: "UYU",
    date: new Date("2026-03-08T00:00:00"),
    responsible: "María González",
    relatedEntity: "Movimiento · Refrigerios",
    justification:
      "El proveedor no emitió boleta en el momento de la compra y fue necesario resolver el gasto de forma inmediata para el evento.",
  },
  {
    id: "voucher-2",
    description: "Transporte local para visita social",
    amount: 2400,
    currency: "UYU",
    date: new Date("2026-03-06T00:00:00"),
    responsible: "Roberto Silva",
    relatedEntity: "Solicitud · Visita social",
    justification:
      "El servicio de transporte fue informal y no entregó documentación fiscal, por lo que se registró el comprobante manual correspondiente.",
  },
  {
    id: "voucher-3",
    description: "Materiales de limpieza sin boleta",
    amount: 3150,
    currency: "UYU",
    date: new Date("2026-03-02T00:00:00"),
    responsible: "Ana Martínez",
    relatedEntity: "Movimiento · Mantenimiento",
    justification:
      "La compra se hizo en un puesto de feria que no emite boleta; se deja constancia del responsable y del gasto.",
  },
];
