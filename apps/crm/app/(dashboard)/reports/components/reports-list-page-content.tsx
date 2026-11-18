import { Clock3, FilePlus2, FolderOpenDot, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { DashboardMetricStrip, DashboardPageHeader } from "@/src/componentes/dashboard";

import type { GeneratedReportListItem } from "../types";
import { ReportGeneratedList } from "./report-generated-list";

interface ReportsListPageContentProps {
  reports: GeneratedReportListItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function ReportsListPageContent({
  reports,
  isLoading = false,
  errorMessage,
}: ReportsListPageContentProps) {
  const readyCount = reports.filter((report) => report.status === "READY").length;
  const processingCount = reports.filter((report) => report.status === "PROCESSING").length;

  return (
    <div className="space-y-2">
      <DashboardPageHeader
        actions={
          <>
            <Button asChild={true} className="rounded-full" type="button" variant="outline">
              <Link href={getChurchRoutePath("reports", "resumen-marzo-2026")}>
                <FolderOpenDot aria-hidden="true" />
                Abrir último generado
              </Link>
            </Button>
            <Button asChild={true} className="rounded-full" type="button">
              <Link href={getChurchRoutePath("reports", "new")}>
                <FilePlus2 aria-hidden="true" />
                Nuevo informe
              </Link>
            </Button>
          </>
        }
        description="Reportes listos para abrir o exportar, y plantillas para crear nuevos."
        emphasis="de tesorería"
        kicker="Gobierno"
        title="Informes"
      />

      <DashboardMetricStrip
        className="xl:grid-cols-3"
        metrics={[
          {
            accent: true,
            label: "Totales",
            value: String(reports.length),
            detail: "Reportes disponibles en el catálogo",
            icon: FolderOpenDot,
          },
          {
            label: "Listos para abrir",
            value: String(readyCount),
            detail: "Listos para abrir o exportar",
            icon: Sparkles,
            tone: "up",
          },
          {
            label: "Pendientes de generación",
            value: String(processingCount),
            detail: "Solicitudes en proceso",
            icon: Clock3,
          },
        ]}
      />

      <ReportGeneratedList reports={reports} isLoading={isLoading} errorMessage={errorMessage} />
    </div>
  );
}
