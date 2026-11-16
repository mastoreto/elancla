import { Clock3, FilePlus2, FolderOpenDot, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";

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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/95 px-6 py-7 shadow-sm md:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(92,180,160,0.18),transparent_65%)] lg:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-accent/10 px-3 py-1 text-accent hover:bg-accent/10">
                Centro de reportes
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Historial y creación
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Reportes generados y nuevos borradores
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                Administra el catálogo de reportes, revisa su estado y crea nuevas vistas para la
                tesorería sin salir del módulo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" asChild={true}>
                <Link href={getChurchRoutePath("reports", "new")}>
                  <FilePlus2 className="size-4" />
                  Nuevo reporte
                </Link>
              </Button>
              <Button type="button" variant="outline" asChild={true}>
                <Link href={getChurchRoutePath("reports", "resumen-marzo-2026")}>
                  <FolderOpenDot className="size-4" />
                  Abrir último generado
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderOpenDot className="size-4 text-accent" />
                Totales
              </div>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{reports.length}</p>
              <p className="text-xs text-muted-foreground">Reportes disponibles en el catálogo</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-income" />
                Listos
              </div>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{readyCount}</p>
              <p className="text-xs text-muted-foreground">Reportes listos para abrir o exportar</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock3 className="size-4 text-amber-600 dark:text-amber-300" />
                En proceso
              </div>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{processingCount}</p>
              <p className="text-xs text-muted-foreground">Solicitudes pendientes de generación</p>
            </div>
          </div>
        </div>
      </section>

      <ReportGeneratedList reports={reports} isLoading={isLoading} errorMessage={errorMessage} />
    </div>
  );
}
