import { BudgetForm } from "@/app/(dashboard)/budgets/components/budget-form";
import type {
  BudgetFormField,
  BudgetFormMode,
  BudgetFormValues,
  BudgetSelectOption,
} from "@/app/(dashboard)/budgets/types/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BudgetModalProps = {
  open: boolean;
  mode: BudgetFormMode;
  values: BudgetFormValues;
  ministryOptions: BudgetSelectOption[];
  projectOptions: BudgetSelectOption[];
  requiredFields?: BudgetFormField[];
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: BudgetFormField, value: BudgetFormValues[BudgetFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function BudgetModal({
  open,
  mode,
  values,
  ministryOptions,
  projectOptions,
  requiredFields,
  onOpenChange,
  onFieldChange,
  onSubmit,
  onCancel,
}: BudgetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear presupuesto" : "Editar presupuesto"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define el alcance, el periodo y el monto visible del nuevo presupuesto."
              : "Actualiza la información visible del presupuesto seleccionado."}
          </DialogDescription>
        </DialogHeader>

        <BudgetForm
          values={values}
          ministryOptions={ministryOptions}
          projectOptions={projectOptions}
          requiredFields={requiredFields}
          onFieldChange={onFieldChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
