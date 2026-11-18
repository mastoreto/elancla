import type { Movement } from "@/lib/types";

/** Earlier expenses of "Fondo de Construcción", shown in its detail tabs. */
export const extraProjectMovements: Movement[] = [
  {
    id: "extra-1",
    date: "2026-03-02",
    concept: "Reparación de techo",
    type: "expense",
    description: "Proveedor Techos del Sur",
    currency: "UYU",
    amount: 92_000,
    project: "Fondo de Construcción",
  },
  {
    id: "extra-2",
    date: "2026-02-21",
    concept: "Impermeabilizante",
    type: "expense",
    description: "Ferretería Central",
    currency: "UYU",
    amount: 41_000,
    project: "Fondo de Construcción",
  },
  {
    id: "extra-3",
    date: "2026-02-10",
    concept: "Andamios",
    type: "expense",
    description: "Alquiler mensual",
    currency: "UYU",
    amount: 17_000,
    project: "Fondo de Construcción",
  },
];
