import { BudgetsPageContent } from "@/app/(dashboard)/budgets/components/budgets-page-content";
import type { Budget, BudgetSelectOption } from "@/app/(dashboard)/budgets/types/index";

const ministryOptions: BudgetSelectOption[] = [
  { value: "administracion", label: "Administración" },
  { value: "accion-social", label: "Acción social" },
  { value: "adoracion", label: "Adoración" },
  { value: "ninos", label: "Niños" },
];

const projectOptions: BudgetSelectOption[] = [
  { value: "campamento-verano", label: "Campamento de verano" },
  { value: "renovacion-sonido", label: "Renovación de sonido" },
  { value: "rediseño-aulas", label: "Rediseño de aulas" },
  { value: "encuentro-lideres", label: "Encuentro de líderes" },
];

const initialBudgets: Budget[] = [
  {
    id: "budget-1",
    name: "Operación mensual del comedor",
    ministry: "Acción social",
    currency: "UYU",
    totalAmount: 1_200_000,
    usedAmount: 825_000,
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
    name: "Campamento de verano",
    project: "Campamento de verano",
    currency: "USD",
    totalAmount: 35_000,
    usedAmount: 21_800,
    startDate: new Date("2026-01-15T00:00:00"),
    endDate: new Date("2026-03-31T00:00:00"),
  },
  {
    id: "budget-4",
    name: "Renovación del sistema de sonido",
    project: "Renovación de sonido",
    currency: "USD",
    totalAmount: 18_000,
    usedAmount: 15_950,
    startDate: new Date("2026-03-01T00:00:00"),
    endDate: new Date("2026-07-30T00:00:00"),
  },
];

export default function BudgetsPage() {
  return (
    <BudgetsPageContent
      initialBudgets={initialBudgets}
      ministryOptions={ministryOptions}
      projectOptions={projectOptions}
    />
  );
}
