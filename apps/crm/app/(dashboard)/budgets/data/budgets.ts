import type { Budget, BudgetSelectOption } from "../types";

export const ministryOptions: BudgetSelectOption[] = [
  { value: "administracion", label: "Administración" },
  { value: "accion-social", label: "Acción social" },
  { value: "adoracion", label: "Adoración" },
  { value: "ninos", label: "Niños" },
];

export const projectOptions: BudgetSelectOption[] = [
  { value: "campamento-verano", label: "Campamento de verano" },
  { value: "renovacion-sonido", label: "Renovación de sonido" },
  { value: "rediseno-aulas", label: "Rediseño de aulas" },
  { value: "encuentro-lideres", label: "Encuentro de líderes" },
];

export const initialBudgets: Budget[] = [
  {
    id: "budget-1",
    name: "Operación mensual del comedor",
    ministry: "Acción social",
    currency: "UYU",
    totalAmount: 1_200_000,
    usedAmount: 828_000,
    startDate: new Date("2026-01-01T00:00:00"),
    endDate: new Date("2026-06-30T00:00:00"),
  },
  {
    id: "budget-2",
    name: "Mantenimiento general del templo",
    ministry: "Administración",
    currency: "UYU",
    totalAmount: 680_000,
    usedAmount: 612_000,
    startDate: new Date("2026-02-01T00:00:00"),
    endDate: new Date("2026-08-31T00:00:00"),
  },
  {
    id: "budget-3",
    name: "Renovación de sonido",
    ministry: "Adoración",
    currency: "USD",
    totalAmount: 4500,
    usedAmount: 1800,
    startDate: new Date("2026-03-01T00:00:00"),
    endDate: new Date("2026-09-30T00:00:00"),
  },
  {
    id: "budget-4",
    name: "Rediseño de aulas",
    ministry: "Niños",
    currency: "UYU",
    totalAmount: 240_000,
    usedAmount: 252_000,
    startDate: new Date("2026-01-01T00:00:00"),
    endDate: new Date("2026-07-31T00:00:00"),
  },
];
