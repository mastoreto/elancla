"use client";

import { PERMISSIONS } from "@ancla/contracts";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardTabs } from "@/components/dashboard/board/board-tabs";
import { SearchField } from "@/components/dashboard/board/search-field";
import { SegmentedToggle } from "@/components/dashboard/board/segmented-toggle";
import { Can } from "@/lib/authz/Gate";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { reportTemplates } from "../data/report-seeds";
import type { GeneratedReportListItem } from "../types";
import { countReportsByTab, filterReports, type ReportsTab } from "../utils/report-list";
import { ReportCard } from "./report-card";
import { ReportCatalog } from "./report-catalog";

type ViewMode = "cards" | "list";

const VIEW_OPTIONS = [
  { value: "cards", label: "Tarjetas", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
] as const;

const reportsListPageContentReportsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
  toolbar: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  spacer: cn("flex-1"),
  grid: cn("grid grid-cols-1 gap-4 lg:grid-cols-2"),
  list: cn("grid grid-cols-1 gap-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function ReportsListPageContent({ reports }: { reports: GeneratedReportListItem[] }) {
  const [tab, setTab] = useState<ReportsTab>("generated");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const counts = countReportsByTab(reports, reportTemplates.length);
  const visible = useMemo(
    () => (tab === "catalog" ? [] : filterReports(reports, { search, tab })),
    [reports, search, tab],
  );

  return (
    <div className={reportsListPageContentReportsPage.page}>
      <div className={reportsListPageContentReportsPage.header}>
        <p className={reportsListPageContentReportsPage.description}>
          Reportes listos para abrir o exportar, y plantillas para crear nuevos.
        </p>
        <Can permission={PERMISSIONS.reports.create}>
          <BoardButton
            className={reportsListPageContentReportsPage.action}
            href={getChurchRoutePath("reports", "new")}
            variant="primary"
          >
            <Plus aria-hidden="true" className={reportsListPageContentReportsPage.icon} />
            Nuevo informe
          </BoardButton>
        </Can>
      </div>

      <BoardTabs
        items={[
          { value: "generated", label: "Listos para abrir", count: counts.generated },
          { value: "pending", label: "Pendientes de generación", count: counts.pending },
          { value: "catalog", label: "Catálogo", count: counts.catalog },
        ]}
        label="Informes"
        onValueChange={setTab}
        value={tab}
      />

      {tab === "catalog" ? null : (
        <div className={reportsListPageContentReportsPage.toolbar}>
          <SearchField
            aria-label="Buscar informe"
            className={reportsListPageContentReportsPage.search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar informe…"
            value={search}
          />
          <span className={reportsListPageContentReportsPage.spacer} />
          <SegmentedToggle
            label="Vista"
            onValueChange={setView}
            options={[...VIEW_OPTIONS]}
            value={view}
          />
        </div>
      )}

      {tab === "catalog" ? null : visible.length === 0 ? (
        <p className={reportsListPageContentReportsPage.empty}>No hay informes encontrados.</p>
      ) : (
        <div
          className={
            view === "cards"
              ? reportsListPageContentReportsPage.grid
              : reportsListPageContentReportsPage.list
          }
        >
          {visible.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {tab === "pending" ? null : <ReportCatalog templates={reportTemplates} />}
    </div>
  );
}
