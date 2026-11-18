"use client";

import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getChurchRoutePath } from "@/lib/church";

import type { GeneratedReportListItem, GeneratedReportsViewMode } from "../types";
import { ReportDataState } from "./report-data-state";
import { ReportGeneratedCard } from "./report-generated-card";
import { ReportGeneratedRow } from "./report-generated-row";
import { ReportListViewToggle } from "./report-list-view-toggle";
import { ReportSectionShell } from "./report-section-shell";

interface ReportGeneratedListProps {
  reports: GeneratedReportListItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
  initialViewMode?: GeneratedReportsViewMode;
}

const loadingCardIds = ["loading-a", "loading-b", "loading-c"] as const;
const recordsLabel = "reportes";

export function ReportGeneratedList({
  reports,
  isLoading = false,
  errorMessage,
  initialViewMode = "GRID",
}: ReportGeneratedListProps) {
  const [viewMode, setViewMode] = useState<GeneratedReportsViewMode>(initialViewMode);
  const isGridView = viewMode === "GRID";

  return (
    <ReportSectionShell
      title="Reportes generados"
      description="Consulta los reportes ya procesados y accede a sus vistas detalladas."
      action={
        !isLoading && !errorMessage ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {reports.length} {recordsLabel}
            </Badge>
            <ReportListViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        ) : (
          <ReportListViewToggle value={viewMode} onChange={setViewMode} />
        )
      }
    >
      {isLoading ? (
        <div className={isGridView ? "grid gap-4 xl:grid-cols-2" : "space-y-3"}>
          {loadingCardIds.map((cardId) => (
            <Card key={cardId} className="border-border/60">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : errorMessage ? (
        <ReportDataState
          variant="error"
          title="Ocurrió un error al mostrar los datos"
          description={errorMessage}
        />
      ) : reports.length === 0 ? (
        <div className="space-y-4">
          <ReportDataState
            variant="empty"
            title="Todavía no hay reportes generados"
            description="Crea un nuevo reporte para empezar a poblar este listado."
          />
          <div className="flex justify-center">
            <Button type="button" asChild={true}>
              <Link href={getChurchRoutePath("reports", "new")}>
                <FilePlus2 className="size-4" />
                Crear primer reporte
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className={isGridView ? "grid gap-4 xl:grid-cols-2" : "space-y-3"}>
          {reports.map((report) =>
            isGridView ? (
              <ReportGeneratedCard key={report.id} report={report} />
            ) : (
              <ReportGeneratedRow key={report.id} report={report} />
            ),
          )}
        </div>
      )}
    </ReportSectionShell>
  );
}
