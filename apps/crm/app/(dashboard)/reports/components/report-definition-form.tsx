import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReportBuilderValues, ReportTemplate } from "../types/index";
import { ReportSectionShell } from "./report-section-shell";

const reportDefinitionFormReportsPage = {
  panel: cn("rounded-2xl border border-border/60 bg-muted/25 px-4 py-4"),
  panelTitle: cn("flex items-center gap-2 text-sm font-medium"),
};

interface ReportDefinitionFormProps {
  values: ReportBuilderValues;
  onChange: (values: ReportBuilderValues) => void;
}

function getTemplateLabel(template: ReportTemplate) {
  switch (template) {
    case "TREASURY":
      return "Tesorería";
    case "MINISTRY":
      return "Ministerio";
    case "EXECUTIVE":
      return "Ejecutivo";
    default:
      return template;
  }
}

export function ReportDefinitionForm({ values, onChange }: ReportDefinitionFormProps) {
  const updateValue = <Key extends keyof ReportBuilderValues>(
    key: Key,
    value: ReportBuilderValues[Key],
  ) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <ReportSectionShell
      title="Definición del reporte"
      description="Asigna un nombre claro, una descripción breve y la plantilla visual inicial."
      action={
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {getTemplateLabel(values.template)}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field className="lg:col-span-2">
          <FieldLabel>Nombre del reporte</FieldLabel>
          <Input
            placeholder="Ej. Resumen mensual de tesorería"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
          />
        </Field>

        <Field className="lg:col-span-2">
          <FieldLabel>Descripción</FieldLabel>
          <Textarea
            placeholder="Describe qué objetivo cubre este reporte y cómo será usado por el equipo."
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            className="min-h-28"
          />
        </Field>

        <Field>
          <FieldLabel>Plantilla</FieldLabel>
          <Select
            value={values.template}
            onValueChange={(value) => updateValue("template", value as ReportTemplate)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una plantilla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TREASURY">Tesorería</SelectItem>
              <SelectItem value="MINISTRY">Ministerio</SelectItem>
              <SelectItem value="EXECUTIVE">Ejecutivo</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className={reportDefinitionFormReportsPage.panel}>
          <div className={reportDefinitionFormReportsPage.panelTitle}>
            <FileText className="size-4 text-accent" />
            Enfoque seleccionado
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            La plantilla{" "}
            <span className="font-medium text-foreground">{getTemplateLabel(values.template)}</span>{" "}
            define el tono visual inicial del reporte y puede adaptarse luego con datos reales.
          </p>
        </div>
      </div>
    </ReportSectionShell>
  );
}
