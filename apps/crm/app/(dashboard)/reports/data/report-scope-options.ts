import type { BoardSelectOption } from "@/components/dashboard/board/board-form";

export const ALL = "all";

export const currencyOptions: BoardSelectOption[] = [
  { value: ALL, label: "Todas las monedas" },
  { value: "UYU", label: "Pesos uruguayos ($U)" },
  { value: "USD", label: "Dólares (USD)" },
];

export const ministryScopeOptions: BoardSelectOption[] = [
  { value: ALL, label: "Todos" },
  { value: "alabanza", label: "Alabanza" },
  { value: "jovenes", label: "Jóvenes" },
  { value: "misiones", label: "Misiones" },
  { value: "mantenimiento", label: "Mantenimiento" },
];

export const projectScopeOptions: BoardSelectOption[] = [
  { value: ALL, label: "Todos" },
  { value: "campamento", label: "Campamento de invierno" },
  { value: "comedor", label: "Comedor solidario" },
  { value: "misioneras", label: "Jornadas misioneras" },
];

export const movementTypeOptions: BoardSelectOption[] = [
  { value: ALL, label: "Todos los movimientos" },
  { value: "INCOME", label: "Solo ingresos" },
  { value: "EXPENSE", label: "Solo egresos" },
];

export const responsibleOptions: BoardSelectOption[] = [
  { value: "tesoreria", label: "Tesorería" },
  { value: "pastoral", label: "Pastoral" },
  { value: "consejo", label: "Consejo" },
];
