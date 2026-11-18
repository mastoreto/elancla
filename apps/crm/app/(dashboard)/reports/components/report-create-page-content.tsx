"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { DashboardPageHeader } from "@/src/componentes/dashboard";

import type { ReportBuilderValues, ReportFilters } from "../types";
import { ReportCreationSummary } from "./report-creation-summary";
import { ReportDefinitionForm } from "./report-definition-form";
import { ReportOutputOptions } from "./report-output-options";
import { ReportScopeForm } from "./report-scope-form";
import { ReportSectionShell } from "./report-section-shell";
import { cn } from "@/lib/utils";

const reportCreatePageContentReportsPage = {
  layout: cn("grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"),
  sidebar: cn("space-y-6 xl:sticky xl:top-6 xl:self-start"),
};

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
      <DashboardPageHeader
        actions={
          <Button asChild={true} className="rounded-full" type="button" variant="outline">
            <Link href={getChurchRoutePath("reports")}>
              <ArrowLeft aria-hidden="true" />
              Volver a informes
            </Link>
          </Button>
        }
        description="Define la estructura, el alcance y la salida del informe antes de generarlo."
        emphasis="informe"
        kicker="Gobierno"
        title="Nuevo"
      />

      <div className={reportCreatePageContentReportsPage.layout}>
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

        <div className={reportCreatePageContentReportsPage.sidebar}>
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
