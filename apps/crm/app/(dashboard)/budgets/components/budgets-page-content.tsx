"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BudgetModal } from "@/app/(dashboard)/budgets/components/budget-modal";
import { BudgetSummaryCards } from "@/app/(dashboard)/budgets/components/budget-summary-cards";
import { BudgetsTable } from "@/app/(dashboard)/budgets/components/budgets-table";
import type {
  Budget,
  BudgetCurrency,
  BudgetFormField,
  BudgetFormMode,
  BudgetFormValues,
  BudgetOwnerType,
  BudgetSelectOption,
  BudgetSummaryValues,
} from "@/app/(dashboard)/budgets/types/index";
import { DashboardPageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";

type BudgetsPageContentProps = {
  initialBudgets: Budget[];
  ministryOptions: BudgetSelectOption[];
  projectOptions: BudgetSelectOption[];
  initialErrorMessage?: string | null;
  isLoading?: boolean;
};

type CurrencyTotals = Record<
  BudgetCurrency,
  {
    total: number;
    used: number;
    available: number;
  }
>;

function formatCurrency(currency: BudgetCurrency, amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string, fallback: Date) {
  if (!value) {
    return fallback;
  }

  return new Date(`${value}T00:00:00`);
}

function createDefaultFormValues(): BudgetFormValues {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  return {
    name: "",
    ownerType: "MINISTRY",
    ministry: "",
    project: "",
    currency: "UYU",
    totalAmount: "",
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

function createSummaryValues(budgets: Budget[]): BudgetSummaryValues | null {
  if (budgets.length === 0) {
    return null;
  }

  const totals = budgets.reduce<CurrencyTotals>(
    (currentTotals, budget) => {
      currentTotals[budget.currency].total += budget.totalAmount;
      currentTotals[budget.currency].used += budget.usedAmount;
      currentTotals[budget.currency].available += budget.totalAmount - budget.usedAmount;

      return currentTotals;
    },
    {
      UYU: { total: 0, used: 0, available: 0 },
      USD: { total: 0, used: 0, available: 0 },
    },
  );

  const formatBreakdown = (valueKey: keyof CurrencyTotals[BudgetCurrency]) => {
    const items = (["UYU", "USD"] as const)
      .filter((currency) => totals[currency][valueKey] > 0)
      .map((currency) => formatCurrency(currency, totals[currency][valueKey]));

    if (items.length === 0) {
      return formatCurrency("UYU", 0);
    }

    return items.join(" · ");
  };

  return {
    totalBudget: formatBreakdown("total"),
    totalUsed: formatBreakdown("used"),
    totalAvailable: formatBreakdown("available"),
  };
}

function mapBudgetToFormValues(budget: Budget): BudgetFormValues {
  return {
    name: budget.name,
    ownerType: budget.project ? "PROJECT" : "MINISTRY",
    ministry: budget.ministry ?? "",
    project: budget.project ?? "",
    currency: budget.currency,
    totalAmount: String(budget.totalAmount),
    startDate: formatDateInput(budget.startDate),
    endDate: formatDateInput(budget.endDate),
  };
}

function mapFormValuesToBudget(values: BudgetFormValues, id: string, usedAmount: number): Budget {
  const fallbackStartDate = new Date();
  const fallbackEndDate = new Date(fallbackStartDate);
  fallbackEndDate.setMonth(fallbackEndDate.getMonth() + 1);

  return {
    id,
    name: values.name,
    ministry: values.ownerType === "MINISTRY" ? values.ministry || undefined : undefined,
    project: values.ownerType === "PROJECT" ? values.project || undefined : undefined,
    currency: values.currency ?? "UYU",
    totalAmount: Number(values.totalAmount) || 0,
    usedAmount,
    startDate: parseDateInput(values.startDate, fallbackStartDate),
    endDate: parseDateInput(values.endDate, fallbackEndDate),
  };
}

export function BudgetsPageContent({
  initialBudgets,
  ministryOptions,
  projectOptions,
  initialErrorMessage = null,
  isLoading = false,
}: BudgetsPageContentProps) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [modalMode, setModalMode] = useState<BudgetFormMode>("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<BudgetFormValues>(createDefaultFormValues());
  const [requiredFields, setRequiredFields] = useState<BudgetFormField[]>([]);

  const summary = useMemo(() => createSummaryValues(budgets), [budgets]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudgetId(null);
    setRequiredFields([]);
  };

  const handleCreate = () => {
    setModalMode("create");
    setEditingBudgetId(null);
    setFormValues(createDefaultFormValues());
    setRequiredFields([]);
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setModalMode("edit");
    setEditingBudgetId(budget.id);
    setFormValues(mapBudgetToFormValues(budget));
    setRequiredFields([]);
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: BudgetFormField, value: BudgetFormValues[BudgetFormField]) => {
    setFormValues((currentValues) => {
      if (field === "ownerType") {
        const nextOwnerType = value as BudgetOwnerType | null;

        return {
          ...currentValues,
          ownerType: nextOwnerType,
          ministry: nextOwnerType === "MINISTRY" ? currentValues.ministry : "",
          project: nextOwnerType === "PROJECT" ? currentValues.project : "",
        };
      }

      return {
        ...currentValues,
        [field]: value,
      };
    });
  };

  const handleSubmit = () => {
    if (modalMode === "edit" && editingBudgetId) {
      setBudgets((currentBudgets) =>
        currentBudgets.map((budget) =>
          budget.id === editingBudgetId
            ? mapFormValuesToBudget(formValues, budget.id, budget.usedAmount)
            : budget,
        ),
      );
      closeModal();
      return;
    }

    const nextBudget = mapFormValuesToBudget(formValues, `budget-${Date.now()}`, 0);

    setBudgets((currentBudgets) => [nextBudget, ...currentBudgets]);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        actions={
          <Button className="rounded-full" onClick={handleCreate} type="button">
            <Plus aria-hidden="true" />
            Nuevo presupuesto
          </Button>
        }
        description="Montos asignados por ministerio y proyecto, con alertas de uso."
        emphasis="con orden"
        kicker="Tesorería"
        title="Presupuestos"
      />

      <BudgetSummaryCards
        summary={summary}
        isLoading={isLoading}
        isEmpty={!isLoading && budgets.length === 0}
        errorMessage={initialErrorMessage}
      />

      <BudgetsTable
        budgets={budgets}
        isLoading={isLoading}
        errorMessage={initialErrorMessage}
        onEdit={handleEdit}
      />

      <BudgetModal
        open={isModalOpen}
        mode={modalMode}
        values={formValues}
        ministryOptions={ministryOptions}
        projectOptions={projectOptions}
        requiredFields={requiredFields}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
            return;
          }

          setIsModalOpen(true);
        }}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  );
}
