import { ChartColumn, LayoutPanelTop, TableProperties } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { ReportBuilderValues, ReportExportFormat } from "../types/index";
import { ReportSectionShell } from "./report-section-shell";

interface ReportOutputOptionsProps {
  values: ReportBuilderValues;
  onChange: (values: ReportBuilderValues) => void;
}

const contentOptions = [
  {
    key: "includeSummary",
    label: "Resumen general",
    description: "Incluye tarjetas con ingresos, egresos, balance y cantidad de movimientos.",
    icon: LayoutPanelTop,
  },
  {
    key: "includeCharts",
    label: "Visualizaciones",
    description: "Agrega placeholders de gráficos para comparación y distribución.",
    icon: ChartColumn,
  },
  {
    key: "includeMovements",
    label: "Tabla de movimientos",
    description: "Incluye el detalle tabular de todos los movimientos contemplados.",
    icon: TableProperties,
  },
] as const;

export function ReportOutputOptions({ values, onChange }: ReportOutputOptionsProps) {
  const toggleOption = (key: "includeSummary" | "includeCharts" | "includeMovements") => {
    onChange({
      ...values,
      [key]: !values[key],
    });
  };

  return (
    <ReportSectionShell
      title="Salida del reporte"
      description="Elige qué bloques visuales estarán visibles y el formato disponible para exportación."
    >
      <div className="space-y-5">
        <div className="grid gap-3 lg:grid-cols-3">
          {contentOptions.map((option) => {
            const Icon = option.icon;
            const isChecked = values[option.key];

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleOption(option.key)}
                aria-pressed={isChecked}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition-colors",
                  isChecked
                    ? "border-accent bg-accent/5"
                    : "border-border/60 bg-background hover:border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="size-4 text-accent" />
                      {option.label}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={undefined}
                    className="pointer-events-none"
                    aria-label={`Incluir ${option.label}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <Field>
          <FieldLabel>Formato de salida</FieldLabel>
          <Select
            value={values.exportFormat}
            onValueChange={(value) =>
              onChange({ ...values, exportFormat: value as ReportExportFormat })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="PDF_CSV">PDF y CSV</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </ReportSectionShell>
  );
}
