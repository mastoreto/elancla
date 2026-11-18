import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ReportCurrency, ReportFilters, ReportMovementType } from "../types/index";
import { ReportMultiSelect } from "./report-multi-select";

interface ReportScopeFieldsProps {
  filters: ReportFilters;
  ministryOptions: string[];
  projectOptions: string[];
  onFiltersChange: (filters: ReportFilters) => void;
  showDateRangeError?: boolean;
}

function formatInputDate(date: Date | null) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseInputNumber(value: string) {
  if (!value) {
    return null;
  }

  return Number(value);
}

export function ReportScopeFields({
  filters,
  ministryOptions,
  projectOptions,
  onFiltersChange,
  showDateRangeError = false,
}: ReportScopeFieldsProps) {
  const allCurrenciesValue = "ALL";
  const allMovementTypesValue = "ALL";

  const updateFilter = <Key extends keyof ReportFilters>(key: Key, value: ReportFilters[Key]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <FieldGroup className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <Field className="xl:col-span-2">
        <FieldLabel>Rango de fechas</FieldLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="date"
            value={formatInputDate(filters.dateFrom)}
            onChange={(event) => updateFilter("dateFrom", parseInputDate(event.target.value))}
            aria-label="Fecha desde"
          />
          <Input
            type="date"
            value={formatInputDate(filters.dateTo)}
            onChange={(event) => updateFilter("dateTo", parseInputDate(event.target.value))}
            aria-label="Fecha hasta"
          />
        </div>
        {showDateRangeError ? <FieldError>Debes seleccionar un rango de fechas</FieldError> : null}
      </Field>

      <ReportMultiSelect
        label="Ministerios"
        placeholder="Selecciona ministerios"
        options={ministryOptions}
        selectedValues={filters.ministries}
        onChange={(values) => updateFilter("ministries", values)}
      />

      <ReportMultiSelect
        label="Proyectos"
        placeholder="Selecciona proyectos"
        options={projectOptions}
        selectedValues={filters.projects}
        onChange={(values) => updateFilter("projects", values)}
      />

      <Field>
        <FieldLabel>Moneda</FieldLabel>
        <Select
          value={filters.currency ?? allCurrenciesValue}
          onValueChange={(value) =>
            updateFilter(
              "currency",
              value === allCurrenciesValue ? null : (value as ReportCurrency),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las monedas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allCurrenciesValue}>Todas las monedas</SelectItem>
            <SelectItem value="UYU">UYU</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Tipo de movimiento</FieldLabel>
        <Select
          value={filters.movementType ?? allMovementTypesValue}
          onValueChange={(value) =>
            updateFilter(
              "movementType",
              value === allMovementTypesValue ? null : (value as ReportMovementType),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los movimientos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allMovementTypesValue}>Todos los movimientos</SelectItem>
            <SelectItem value="INCOME">Ingreso</SelectItem>
            <SelectItem value="EXPENSE">Egreso</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Monto mínimo</FieldLabel>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={filters.minAmount ?? ""}
          onChange={(event) => updateFilter("minAmount", parseInputNumber(event.target.value))}
        />
      </Field>

      <Field>
        <FieldLabel>Monto máximo</FieldLabel>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={filters.maxAmount ?? ""}
          onChange={(event) => updateFilter("maxAmount", parseInputNumber(event.target.value))}
        />
      </Field>
    </FieldGroup>
  );
}
