import type {
  BudgetCurrency,
  BudgetFormField,
  BudgetFormValues,
  BudgetOwnerType,
  BudgetSelectOption,
} from "@/app/(dashboard)/budgets/types/index";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BudgetFormProps = {
  values: BudgetFormValues;
  ministryOptions: BudgetSelectOption[];
  projectOptions: BudgetSelectOption[];
  requiredFields?: BudgetFormField[];
  onFieldChange: (field: BudgetFormField, value: BudgetFormValues[BudgetFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const ownerTypeOptions: Array<{
  value: BudgetOwnerType;
  label: string;
}> = [
  { value: "MINISTRY", label: "Ministerio" },
  { value: "PROJECT", label: "Proyecto" },
];

const currencyOptions: Array<{
  value: BudgetCurrency;
  label: string;
}> = [
  { value: "UYU", label: "UYU" },
  { value: "USD", label: "USD" },
];

export function BudgetForm({
  values,
  ministryOptions,
  projectOptions,
  requiredFields = [],
  onFieldChange,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const hasError = (field: BudgetFormField) => requiredFields.includes(field);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup className="grid gap-4 md:grid-cols-2 [&>[data-slot=field]]:gap-2">
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="budget-name">Nombre</FieldLabel>
          <Input
            id="budget-name"
            placeholder="Escribe el nombre del presupuesto"
            value={values.name}
            aria-invalid={hasError("name") || undefined}
            onChange={(event) => onFieldChange("name", event.target.value)}
          />
          {hasError("name") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <Select
            value={values.ownerType ?? undefined}
            onValueChange={(value) => onFieldChange("ownerType", value as BudgetOwnerType)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("ownerType") || undefined}>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {ownerTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("ownerType") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Moneda</FieldLabel>
          <Select
            value={values.currency ?? undefined}
            onValueChange={(value) => onFieldChange("currency", value as BudgetCurrency)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("currency") || undefined}>
              <SelectValue placeholder="Selecciona una moneda" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("currency") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Ministerio</FieldLabel>
          <Select
            value={values.ministry || undefined}
            disabled={values.ownerType !== "MINISTRY"}
            onValueChange={(value) => onFieldChange("ministry", value)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("ministry") || undefined}>
              <SelectValue
                placeholder={
                  values.ownerType === "MINISTRY"
                    ? "Selecciona un ministerio"
                    : "No aplica para este tipo"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {ministryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("ministry") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Proyecto</FieldLabel>
          <Select
            value={values.project || undefined}
            disabled={values.ownerType !== "PROJECT"}
            onValueChange={(value) => onFieldChange("project", value)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("project") || undefined}>
              <SelectValue
                placeholder={
                  values.ownerType === "PROJECT"
                    ? "Selecciona un proyecto"
                    : "No aplica para este tipo"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("project") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="budget-total-amount">Monto total</FieldLabel>
          <Input
            id="budget-total-amount"
            type="number"
            min="0"
            placeholder="Ingresa el monto total"
            value={values.totalAmount}
            aria-invalid={hasError("totalAmount") || undefined}
            onChange={(event) => onFieldChange("totalAmount", event.target.value)}
          />
          {hasError("totalAmount") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="budget-start-date">Fecha inicio</FieldLabel>
          <Input
            id="budget-start-date"
            type="date"
            value={values.startDate}
            aria-invalid={hasError("startDate") || undefined}
            onChange={(event) => onFieldChange("startDate", event.target.value)}
          />
          {hasError("startDate") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="budget-end-date">Fecha fin</FieldLabel>
          <Input
            id="budget-end-date"
            type="date"
            value={values.endDate}
            aria-invalid={hasError("endDate") || undefined}
            onChange={(event) => onFieldChange("endDate", event.target.value)}
          />
          {hasError("endDate") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
