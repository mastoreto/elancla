import type {
  ReceiptCurrency,
  ReceiptFormField,
  ReceiptFormValues,
  ReceiptRelatedOption,
} from "@/app/(dashboard)/receipts/types/index";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const receiptFormReceiptsPage = {
  fields: cn("grid gap-4 md:grid-cols-2 [&>[data-slot=field]]:gap-2"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

interface ReceiptFormProps {
  values: ReceiptFormValues;
  relatedOptions: ReceiptRelatedOption[];
  requiredFields?: ReceiptFormField[];
  onFieldChange: (field: ReceiptFormField, value: ReceiptFormValues[ReceiptFormField]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const currencyOptions: Array<{ value: ReceiptCurrency; label: string }> = [
  { value: "UYU", label: "UYU" },
  { value: "USD", label: "USD" },
];

export function ReceiptForm({
  values,
  relatedOptions,
  requiredFields = [],
  onFieldChange,
  onSubmit,
  onCancel,
}: ReceiptFormProps) {
  const hasError = (field: ReceiptFormField) => requiredFields.includes(field);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup className={receiptFormReceiptsPage.fields}>
        <Field>
          <FieldLabel htmlFor="receipt-number">Número de boleta</FieldLabel>
          <Input
            id="receipt-number"
            placeholder="Ingresa el número de boleta"
            value={values.number}
            aria-invalid={hasError("number") || undefined}
            onChange={(event) => onFieldChange("number", event.target.value)}
          />
          {hasError("number") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="receipt-provider">Proveedor</FieldLabel>
          <Input
            id="receipt-provider"
            placeholder="Ingresa el proveedor"
            value={values.provider}
            aria-invalid={hasError("provider") || undefined}
            onChange={(event) => onFieldChange("provider", event.target.value)}
          />
          {hasError("provider") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="receipt-amount">Monto</FieldLabel>
          <Input
            id="receipt-amount"
            type="number"
            min="0"
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
            value={values.currency ?? undefined}
            onValueChange={(value) => onFieldChange("currency", value as ReceiptCurrency)}
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
          <FieldLabel htmlFor="receipt-date">Fecha</FieldLabel>
          <Input
            id="receipt-date"
            type="date"
            value={values.date}
            aria-invalid={hasError("date") || undefined}
            onChange={(event) => onFieldChange("date", event.target.value)}
          />
          {hasError("date") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field>
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
                  {`${option.category} · ${option.label}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("relatedEntity") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="receipt-file">Archivo</FieldLabel>
          <Input
            id="receipt-file"
            type="file"
            accept=".pdf,image/*"
            aria-invalid={hasError("fileUrl") || undefined}
            onChange={(event) => {
              const nextFileName = event.target.files?.[0]?.name ?? "";
              onFieldChange("fileUrl", nextFileName);
            }}
          />
          <FieldDescription>
            {values.fileUrl
              ? `Archivo seleccionado: ${values.fileUrl}`
              : "Adjunta una imagen o PDF para asociarlo a la boleta."}
          </FieldDescription>
          {hasError("fileUrl") ? <FieldError>Este campo es obligatorio</FieldError> : null}
        </Field>
      </FieldGroup>

      <div className={receiptFormReceiptsPage.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
