"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { Can } from "@/lib/authz/Gate";
import { cn } from "@/lib/utils";
import type {
  Budget,
  BudgetFormField,
  BudgetFormMode,
  BudgetFormValues,
  BudgetOwnerType,
  BudgetSelectOption,
} from "../types";
import {
  BUDGETS_PAGE_SIZE,
  createDefaultFormValues,
  filterBudgets,
  getBudgetOwner,
  mapBudgetToFormValues,
  mapFormValuesToBudget,
  paginateBudgets,
  summarizeBudgets,
} from "../utils";
import { BudgetModal } from "./budget-modal";
import { BudgetsSummary } from "./budgets-summary";
import { BudgetsTable } from "./budgets-table";
import { BudgetsToolbar } from "./budgets-toolbar";

type BudgetsPageContentProps = {
  initialBudgets: Budget[];
  ministryOptions: BudgetSelectOption[];
  projectOptions: BudgetSelectOption[];
  initialErrorMessage?: string | null;
};

const budgetsPageContentBudgetsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  actionIcon: cn("size-4"),
};

export function BudgetsPageContent({
  initialBudgets,
  ministryOptions,
  projectOptions,
  initialErrorMessage = null,
}: BudgetsPageContentProps) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [modalMode, setModalMode] = useState<BudgetFormMode>("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<BudgetFormValues>(createDefaultFormValues());
  const [requiredFields, setRequiredFields] = useState<BudgetFormField[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [ministry, setMinistry] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [page, setPage] = useState(1);

  const summary = useMemo(() => summarizeBudgets(budgets), [budgets]);
  const ministries = useMemo(
    () => [...new Set(budgets.map(getBudgetOwner).filter(Boolean))].sort(),
    [budgets],
  );
  const filtered = useMemo(
    () => filterBudgets(budgets, { searchQuery, ministry, currency }),
    [budgets, searchQuery, ministry, currency],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / BUDGETS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const withFirstPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

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

  const handleDelete = (budget: Budget) => {
    setBudgets((currentBudgets) => currentBudgets.filter((item) => item.id !== budget.id));
  };

  return (
    <div className={budgetsPageContentBudgetsPage.page}>
      <div className={budgetsPageContentBudgetsPage.header}>
        <p className={budgetsPageContentBudgetsPage.description}>
          Montos asignados por ministerio y proyecto, con alertas de uso.
        </p>
        <Can permission="budgets:create">
          <BoardButton onClick={handleCreate} variant="primary">
            <Plus aria-hidden="true" className={budgetsPageContentBudgetsPage.actionIcon} />
            Nuevo presupuesto
          </BoardButton>
        </Can>
      </div>

      <BudgetsSummary summary={summary} />

      <BudgetsToolbar
        currency={currency}
        ministries={ministries}
        ministry={ministry}
        onCurrencyChange={withFirstPage(setCurrency)}
        onMinistryChange={withFirstPage(setMinistry)}
        onSearchChange={withFirstPage(setSearchQuery)}
        searchQuery={searchQuery}
      />

      <BudgetsTable
        budgets={paginateBudgets(filtered, currentPage)}
        errorMessage={initialErrorMessage}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onPageChange={setPage}
        page={currentPage}
        pageCount={pageCount}
        total={filtered.length}
      />

      <BudgetModal
        mode={modalMode}
        ministryOptions={ministryOptions}
        onCancel={closeModal}
        onFieldChange={handleFieldChange}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
            return;
          }
          setIsModalOpen(true);
        }}
        onSubmit={handleSubmit}
        open={isModalOpen}
        projectOptions={projectOptions}
        requiredFields={requiredFields}
        values={formValues}
      />
    </div>
  );
}
