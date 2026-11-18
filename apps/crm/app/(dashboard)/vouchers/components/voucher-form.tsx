import type {
  VoucherCurrency,
  VoucherFormField,
  VoucherFormValues,
  VoucherRelatedOption,
} from "@/app/(dashboard)/vouchers/types";
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
import { Textarea } from "@/components/ui/textarea";

interface VoucherFormProps {
  values: VoucherFormValues;
  relatedOptions: VoucherRelatedOption[];
  requiredFields?: VoucherFormField[];
  onFieldChange: (field: VoucherFormField, value: VoucherFormValues[VoucherFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const currencyOptions: Array<{ value: VoucherCurrency; label: string }> = [
  { value: "UYU", label: "UYU" },
  { value: "USD", label: "USD" },
];

function getRelatedOptionLabel(option: VoucherRelatedOption) {
  if (option.kind === "movement") {
    return `Movimiento · ${option.label}`;
  }

  return `Solicitud · ${option.label}`;
}

export function VoucherForm({
  values,
  relatedOptions,
  requiredFields = [],
  onFieldChange,
  onSubmit,
  onCancel,
}: VoucherFormProps) {
  const hasError = (field: VoucherFormField) => requiredFields.includes(field);

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
          <FieldLabel htmlFor="voucher-description">Descripción</FieldLabel>
          <Input
            id="voucher-description"
            placeholder="Describe el gasto respaldado por el comprobante"
            value={values.description}
            aria-invalid={hasError("description") || undefined}
            onChange={(event) => onFieldChange("description", event.target.value)}
          />
          {hasError("description") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="voucher-justification">Justificación</FieldLabel>
          <Textarea
            id="voucher-justification"
            placeholder="Explica por qué no existe boleta y cuál es el fundamento del gasto"
            value={values.justification}
            aria-invalid={hasError("justification") || undefined}
            onChange={(event) => onFieldChange("justification", event.target.value)}
          />
          {hasError("justification") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="voucher-amount">Monto</FieldLabel>
          <Input
            id="voucher-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="Ingresa el monto"
            value={values.amount}
            aria-invalid={hasError("amount") || undefined}
            onChange={(event) => onFieldChange("amount", event.target.value)}
          />
          {hasError("amount") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel>Moneda</FieldLabel>
          <Select
            value={values.currency}
            onValueChange={(value) => onFieldChange("currency", value as VoucherCurrency)}
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
          <FieldLabel htmlFor="voucher-date">Fecha</FieldLabel>
          <Input
            id="voucher-date"
            type="date"
            value={values.date}
            aria-invalid={hasError("date") || undefined}
            onChange={(event) => onFieldChange("date", event.target.value)}
          />
          {hasError("date") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="voucher-responsible">Responsable</FieldLabel>
          <Input
            id="voucher-responsible"
            placeholder="Ingresa la persona responsable"
            value={values.responsible}
            aria-invalid={hasError("responsible") || undefined}
            onChange={(event) => onFieldChange("responsible", event.target.value)}
          />
          {hasError("responsible") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Relacionado a</FieldLabel>
          <Select
            value={values.relatedEntity || undefined}
            onValueChange={(value) => onFieldChange("relatedEntity", value)}
          >
            <SelectTrigger className="w-full" aria-invalid={hasError("relatedEntity") || undefined}>
              <SelectValue placeholder="Selecciona un movimiento o solicitud" />
            </SelectTrigger>
            <SelectContent>
              {relatedOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {getRelatedOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("relatedEntity") ? <FieldError>Este campo es obligatorio</FieldError> : null}
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
