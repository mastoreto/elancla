"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_STATUSES,
  type InventoryFormErrors,
  inventoryFormSchema,
} from "../schema";
import type { InventoryFormValues } from "../types";

const ACQUISITION_MODES = ["Compra", "Donación", "Préstamo permanente"] as const;

export const EMPTY_INVENTORY_FORM: InventoryFormValues = {
  name: "",
  category: "",
  location: "",
  quantity: "1",
  status: "Bueno",
  brand: "",
  model: "",
  serialNumber: "",
  responsible: "",
  acquiredOn: "",
  acquisitionMode: "Compra",
  value: "",
  notes: "",
};

interface InventoryFormProps {
  mode: "create" | "edit";
  initialValues?: InventoryFormValues;
}

const inventoryFormInventoryPage = {
  form: cn("space-y-6"),
  card: cn("space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"),
  cardTitle: cn("font-display text-lg font-medium"),
  pair: cn("grid gap-5 md:grid-cols-2"),
  trio: cn("grid gap-5 md:grid-cols-3"),
  actions: cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"),
};

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}

function TextField({ id, label, value, placeholder, error, type, onChange }: TextFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        aria-invalid={Boolean(error)}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

interface OptionFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}

function OptionField({ label, value, options, placeholder, error, onChange }: OptionFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger aria-invalid={Boolean(error)} aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}

export function InventoryForm({ mode, initialValues = EMPTY_INVENTORY_FORM }: InventoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<InventoryFormValues>(initialValues);
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const isEdit = mode === "edit";

  const update = <K extends keyof InventoryFormValues>(field: K, value: InventoryFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  // Seed-data screen: validating and returning to the list stands in for the real save.
  const submit = () => {
    const result = inventoryFormSchema.safeParse(values);
    if (!result.success) {
      const next: InventoryFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof InventoryFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    router.push(getChurchRoutePath("inventory"));
  };

  return (
    <form
      className={inventoryFormInventoryPage.form}
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DashboardPageHeader
        description="Ficha del ítem, adquisición y responsable."
        emphasis="ítem"
        kicker="Gobierno · Inventario"
        title={isEdit ? "Editar" : "Nuevo"}
      />

      <section className={inventoryFormInventoryPage.card}>
        <h2 className={inventoryFormInventoryPage.cardTitle}>Datos del ítem</h2>
        <TextField
          error={errors.name}
          id="inventory-name"
          label="Nombre *"
          onChange={(value) => update("name", value)}
          placeholder="Ej. Consola de sonido"
          value={values.name}
        />
        <div className={inventoryFormInventoryPage.trio}>
          <OptionField
            error={errors.category}
            label="Categoría *"
            onChange={(value) => update("category", value as InventoryFormValues["category"])}
            options={INVENTORY_CATEGORIES}
            placeholder="Elegir"
            value={values.category}
          />
          <TextField
            error={errors.quantity}
            id="inventory-quantity"
            label="Cantidad *"
            onChange={(value) => update("quantity", value)}
            type="number"
            value={values.quantity}
          />
          <OptionField
            label="Estado"
            onChange={(value) => update("status", value as InventoryFormValues["status"])}
            options={INVENTORY_STATUSES}
            value={values.status}
          />
        </div>
        <div className={inventoryFormInventoryPage.trio}>
          <TextField
            id="inventory-brand"
            label="Marca"
            onChange={(value) => update("brand", value)}
            value={values.brand}
          />
          <TextField
            id="inventory-model"
            label="Modelo"
            onChange={(value) => update("model", value)}
            value={values.model}
          />
          <TextField
            id="inventory-serial"
            label="N.º de serie"
            onChange={(value) => update("serialNumber", value)}
            value={values.serialNumber}
          />
        </div>
      </section>

      <section className={inventoryFormInventoryPage.card}>
        <h2 className={inventoryFormInventoryPage.cardTitle}>Ubicación y responsable</h2>
        <div className={inventoryFormInventoryPage.pair}>
          <TextField
            error={errors.location}
            id="inventory-location"
            label="Ubicación *"
            onChange={(value) => update("location", value)}
            placeholder="Dónde está guardado"
            value={values.location}
          />
          <TextField
            id="inventory-responsible"
            label="Responsable"
            onChange={(value) => update("responsible", value)}
            placeholder="Persona o equipo"
            value={values.responsible}
          />
        </div>
      </section>

      <section className={inventoryFormInventoryPage.card}>
        <h2 className={inventoryFormInventoryPage.cardTitle}>Adquisición</h2>
        <div className={inventoryFormInventoryPage.trio}>
          <TextField
            id="inventory-acquired"
            label="Fecha de adquisición"
            onChange={(value) => update("acquiredOn", value)}
            placeholder="dd mmm aaaa"
            value={values.acquiredOn}
          />
          <OptionField
            label="Modo"
            onChange={(value) => update("acquisitionMode", value)}
            options={ACQUISITION_MODES}
            value={values.acquisitionMode}
          />
          <TextField
            id="inventory-value"
            label="Valor estimado"
            onChange={(value) => update("value", value)}
            type="number"
            value={values.value}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="inventory-notes">Observaciones</FieldLabel>
          <Textarea
            id="inventory-notes"
            onChange={(event) => update("notes", event.target.value)}
            rows={3}
            value={values.notes}
          />
        </Field>
      </section>

      <div className={inventoryFormInventoryPage.actions}>
        <Button asChild={true} type="button" variant="ghost">
          <Link href={getChurchRoutePath("inventory")}>Cancelar</Link>
        </Button>
        <Button type="submit">{isEdit ? "Guardar cambios" : "Crear ítem"}</Button>
      </div>
    </form>
  );
}
