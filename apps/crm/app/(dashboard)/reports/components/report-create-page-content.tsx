"use client";

import { ArrowLeft, FilePlus2, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";

import type { ReportBuilderValues, ReportFilters } from "../types";
import { ReportCreationSummary } from "./report-creation-summary";
import { ReportDefinitionForm } from "./report-definition-form";
import { ReportOutputOptions } from "./report-output-options";
import { ReportScopeForm } from "./report-scope-form";
import { ReportSectionShell } from "./report-section-shell";

interface ReportCreatePageContentProps {
  initialValues: ReportBuilderValues;
  ministryOptions: string[];
  projectOptions: string[];
}

function cloneFilters(filters: ReportFilters): ReportFilters {
  return {
    ...filters,
    ministries: [...filters.ministries],
    projects: [...filters.projects],
  };
}

function cloneBuilderValues(values: ReportBuilderValues): ReportBuilderValues {
  return {
    ...values,
    filters: cloneFilters(values.filters),
  };
}

export function ReportCreatePageContent({
  initialValues,
  ministryOptions,
  projectOptions,
}: ReportCreatePageContentProps) {
  const [values, setValues] = useState<ReportBuilderValues>(() =>
    cloneBuilderValues(initialValues),
  );
  const [showDateRangeError, setShowDateRangeError] = useState(false);

  const handleValuesChange = (nextValues: ReportBuilderValues) => {
    setValues(nextValues);

    if (showDateRangeError && nextValues.filters.dateFrom && nextValues.filters.dateTo) {
      setShowDateRangeError(false);
    }
  };

  const handleFiltersChange = (filters: ReportFilters) => {
    handleValuesChange({
      ...values,
      filters,
    });
  };

  const handleReset = () => {
    setValues(cloneBuilderValues(initialValues));
    setShowDateRangeError(false);
  };

  const handleGenerateClick = () => {
    if (!values.filters.dateFrom || !values.filters.dateTo) {
      setShowDateRangeError(true);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 px-6 py-7 shadow-sm md:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(92,180,160,0.18),transparent_65%)] lg:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild={true}>
                <Link href={getChurchRoutePath("reports")}>
                  <ArrowLeft className="size-4" />
                  Volver a reportes
                </Link>
              </Button>
              <Badge className="rounded-full bg-accent/10 px-3 py-1 text-accent hover:bg-accent/10">
                Nuevo reporte
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Constructor UI
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Crear un nuevo reporte
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                Define la estructura, el alcance y la salida del reporte antes de conectarlo con la
                capa de generación real.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FilePlus2 className="size-4 text-accent" />
                Configuración
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Nombre, plantilla, filtros y formato de salida.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <WandSparkles className="size-4 text-income" />
                Preparado para datos reales
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                La vista queda lista para conectarse luego a generación real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <ReportDefinitionForm values={values} onChange={handleValuesChange} />

          <ReportScopeForm
            filters={values.filters}
            ministryOptions={ministryOptions}
            projectOptions={projectOptions}
            onFiltersChange={handleFiltersChange}
            showDateRangeError={showDateRangeError}
          />

          <ReportOutputOptions values={values} onChange={handleValuesChange} />
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <ReportCreationSummary values={values} showDateRangeError={showDateRangeError} />

          <ReportSectionShell
            title="Acciones"
            description="Controles de UI preparados para integrarse después con la generación real."
          >
            <div className="flex flex-col gap-3">
              <Button type="button" onClick={handleGenerateClick}>
                Generar reporte
              </Button>
              <Button type="button" variant="secondary">
                Guardar borrador
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Restablecer formulario
              </Button>
              <Button type="button" variant="ghost" asChild={true}>
                <Link href={getChurchRoutePath("reports")}>Cancelar</Link>
              </Button>
            </div>
          </ReportSectionShell>
        </div>
      </div>
    </div>
  );
}
