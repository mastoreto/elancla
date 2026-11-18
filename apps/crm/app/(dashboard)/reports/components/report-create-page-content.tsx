"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { ALL } from "../data/report-scope-options";
import { FORMAT_LABELS, generatedReports, reportTemplates } from "../data/report-seeds";
import type { ReportFormat, ReportKind } from "../types";
import {
  canGenerateReport,
  countIncludedBlocks,
  describeReportPeriod,
  isReportKind,
  REPORT_BLOCK_COUNT,
  type ReportBuilderBlocks,
} from "../utils/report-builder";
import { ReportOutputSection } from "./report-output-section";
import { ReportScopeSection, type ReportScopeValues } from "./report-scope-section";
import { ReportSummaryPanel } from "./report-summary-panel";
import { ReportTemplatePicker } from "./report-template-picker";

const SAMPLE_MOVEMENT_COUNT = 48;
const PERIOD_FALLBACK = "Sin definir";

const initialScope: ReportScopeValues = {
  name: "",
  range: undefined,
  currency: ALL,
  ministry: ALL,
  project: ALL,
  movementType: ALL,
  responsible: "tesoreria",
  minAmount: "",
  maxAmount: "",
};

const reportCreatePageContentReportsPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  layout: cn("grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.6fr_1fr]"),
  column: cn("flex flex-col gap-[18px]"),
  card: cn("p-6"),
};

export function ReportCreatePageContent() {
  const router = useRouter();
  const templateParam = useSearchParams().get("template");
  const [kind, setKind] = useState<ReportKind>(
    isReportKind(templateParam) ? templateParam : "SUMMARY",
  );
  const [scope, setScope] = useState<ReportScopeValues>(initialScope);
  const [blocks, setBlocks] = useState<ReportBuilderBlocks>({
    summary: true,
    charts: true,
    movements: true,
  });
  const [format, setFormat] = useState<ReportFormat>("PDF");

  const template = reportTemplates.find((item) => item.kind === kind);
  const title = scope.name.trim() || template?.name || "Nuevo informe";
  const includedBlocks = countIncludedBlocks(blocks);

  const handleGenerate = () => {
    // UI only: the first seeded report stands in for the generated one.
    router.push(getChurchRoutePath("reports", generatedReports[0].id));
  };

  return (
    <div className={reportCreatePageContentReportsPage.page}>
      <div className={reportCreatePageContentReportsPage.header}>
        <p className={reportCreatePageContentReportsPage.description}>
          Configura el alcance y elige qué incluir; lo generamos en segundos.
        </p>
        <BoardButton href={getChurchRoutePath("reports")} variant="ghost">
          Cancelar
        </BoardButton>
      </div>

      <div className={reportCreatePageContentReportsPage.layout}>
        <div className={reportCreatePageContentReportsPage.column}>
          <BoardCard className={reportCreatePageContentReportsPage.card}>
            <BoardCardHeader subtitle="Elige el tipo de informe" title="1 · Plantilla" />
            <ReportTemplatePicker
              onValueChange={setKind}
              templates={reportTemplates}
              value={kind}
            />
          </BoardCard>
          <BoardCard className={reportCreatePageContentReportsPage.card}>
            <BoardCardHeader subtitle="Qué movimientos incluir" title="2 · Alcance" />
            <ReportScopeSection
              onChange={(patch) => setScope((current) => ({ ...current, ...patch }))}
              values={scope}
            />
          </BoardCard>
          <BoardCard className={reportCreatePageContentReportsPage.card}>
            <BoardCardHeader subtitle="Bloques y formato" title="3 · Salida" />
            <ReportOutputSection
              blocks={blocks}
              format={format}
              onBlocksChange={setBlocks}
              onFormatChange={setFormat}
            />
          </BoardCard>
        </div>

        <ReportSummaryPanel
          blocksLabel={`${includedBlocks} de ${REPORT_BLOCK_COUNT}`}
          canGenerate={canGenerateReport(title, blocks, format)}
          formatLabel={FORMAT_LABELS[format]}
          movementCount={SAMPLE_MOVEMENT_COUNT}
          onGenerate={handleGenerate}
          period={describeReportPeriod(scope.range, PERIOD_FALLBACK)}
          title={title}
        />
      </div>
    </div>
  );
}
