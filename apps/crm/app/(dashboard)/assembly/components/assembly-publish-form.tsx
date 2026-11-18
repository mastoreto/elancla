"use client";

import { Eye, MapPin, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generatedReports } from "@/app/(dashboard)/reports/data/report-seeds";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardFormRow,
  BoardInput,
  BoardSelect,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { radiusOptions } from "../data/assembly-publish-options";
import { type AssemblyPublishErrors, assemblyPublishSchema } from "../schema";
import type { AssemblyPublishFormValues } from "../types";
import { generateAccessCode } from "../utils/assembly-code";
import { buildAccessLink, describeValidity } from "../utils/assembly-view";
import { AssemblyPublishSummary } from "./assembly-publish-summary";

const REPORT_OPTIONS = generatedReports
  .filter((report) => report.status === "READY")
  .map((report) => ({ value: report.id, label: report.name }));

const INITIAL_VALUES: AssemblyPublishFormValues = {
  reportId: REPORT_OPTIONS[0]?.value ?? "",
  accessCode: "ASM-7K4Q92",
  validFrom: "2026-11-24T10:30",
  validTo: "2026-11-24T14:00",
  manualEnable: true,
  autoRevoke: true,
  address: "Av. Italia 3421, Montevideo",
  radius: "150",
  requireLocation: true,
};

const assemblyPublishFormAssemblyPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  layout: cn("grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.6fr_1fr]"),
  column: cn("flex flex-col gap-[18px]"),
  card: cn("p-6"),
  fields: cn("flex flex-col gap-3.5"),
  preview: cn("flex flex-wrap items-center gap-3 rounded-[20px] bg-secondary px-4 py-3.5"),
  previewText: cn("min-w-60 flex-1 text-[13px] leading-normal text-[var(--tinta-suave)]"),
  codeBox: cn("flex flex-wrap items-center gap-4 rounded-[22px] bg-secondary px-[18px] py-4"),
  codeText: cn("flex flex-1 flex-col gap-0.5"),
  code: cn("font-display text-[32px] leading-none font-semibold tracking-[0.06em] tabular-nums"),
  codeLink: cn("text-[13px] text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
  pinIcon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

export function AssemblyPublishForm() {
  const router = useRouter();
  const [values, setValues] = useState<AssemblyPublishFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<AssemblyPublishErrors>({});

  const update = <K extends keyof AssemblyPublishFormValues>(
    field: K,
    value: AssemblyPublishFormValues[K],
  ) => setValues((previous) => ({ ...previous, [field]: value }));

  const report = generatedReports.find((item) => item.id === values.reportId);
  const radiusLabel = `Radio ${values.radius} m`;
  const parsed = assemblyPublishSchema.safeParse(values);

  const goToList = () => router.push(getChurchRoutePath("assembly"));
  const create = () => {
    if (!parsed.success) {
      const next: AssemblyPublishErrors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof AssemblyPublishErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    goToList();
  };

  return (
    <div className={assemblyPublishFormAssemblyPage.page}>
      <div className={assemblyPublishFormAssemblyPage.header}>
        <p className={assemblyPublishFormAssemblyPage.description}>
          Define informe, vigencia y lugar. Quedará cerrado hasta que lo habilites.
        </p>
        <BoardButton href={getChurchRoutePath("assembly")} variant="ghost">
          Cancelar
        </BoardButton>
      </div>

      <div className={assemblyPublishFormAssemblyPage.layout}>
        <div className={assemblyPublishFormAssemblyPage.column}>
          <BoardCard className={assemblyPublishFormAssemblyPage.card}>
            <BoardCardHeader
              subtitle="Elige un informe ya generado"
              title="1 · Informe a publicar"
            />
            <div className={assemblyPublishFormAssemblyPage.fields}>
              <BoardSelect
                error={errors.reportId}
                id="assembly-report"
                label="Informe"
                onValueChange={(value) => update("reportId", value)}
                options={REPORT_OPTIONS}
                value={values.reportId}
              />
              <div className={assemblyPublishFormAssemblyPage.preview}>
                <span className={assemblyPublishFormAssemblyPage.previewText}>
                  {report?.generatedLabel} por María García · 48 movimientos · se mostrará completo
                  (resumen, gráficos y detalle).
                </span>
                <BoardButton
                  href={
                    report
                      ? getChurchRoutePath("reports", report.id)
                      : getChurchRoutePath("reports")
                  }
                  size="sm"
                  variant="outline"
                >
                  <Eye aria-hidden="true" className={assemblyPublishFormAssemblyPage.icon} />
                  Vista previa
                </BoardButton>
              </div>
            </div>
          </BoardCard>

          <BoardCard className={assemblyPublishFormAssemblyPage.card}>
            <BoardCardHeader
              subtitle="Se genera solo; puedes cambiarlo"
              title="2 · Código de acceso"
            />
            <div className={assemblyPublishFormAssemblyPage.codeBox}>
              <div className={assemblyPublishFormAssemblyPage.codeText}>
                <b className={assemblyPublishFormAssemblyPage.code}>{values.accessCode}</b>
                <span className={assemblyPublishFormAssemblyPage.codeLink}>
                  {buildAccessLink(values.accessCode)}
                </span>
              </div>
              <BoardButton onClick={() => update("accessCode", generateAccessCode())} size="sm">
                <RefreshCw aria-hidden="true" className={assemblyPublishFormAssemblyPage.icon} />
                Regenerar
              </BoardButton>
            </div>
          </BoardCard>

          <BoardCard className={assemblyPublishFormAssemblyPage.card}>
            <BoardCardHeader subtitle="Cuándo se podrá abrir el informe" title="3 · Vigencia" />
            <div className={assemblyPublishFormAssemblyPage.fields}>
              <BoardFormRow>
                <BoardInput
                  error={errors.validFrom}
                  id="assembly-from"
                  label="Desde"
                  onChange={(event) => update("validFrom", event.target.value)}
                  type="datetime-local"
                  value={values.validFrom}
                />
                <BoardInput
                  error={errors.validTo}
                  id="assembly-to"
                  label="Hasta"
                  onChange={(event) => update("validTo", event.target.value)}
                  type="datetime-local"
                  value={values.validTo}
                />
              </BoardFormRow>
              <BoardSwitchRow
                checked={values.manualEnable}
                hint="El informe queda cerrado hasta que lo abras tú desde el panel, aunque ya esté dentro de la vigencia."
                onCheckedChange={(checked) => update("manualEnable", checked)}
                title="Habilitar manualmente"
              />
              <BoardSwitchRow
                checked={values.autoRevoke}
                hint="Si está apagado, queda abierto hasta que lo bajes tú."
                onCheckedChange={(checked) => update("autoRevoke", checked)}
                title="Dar de baja automáticamente al vencer"
              />
            </div>
          </BoardCard>

          <BoardCard className={assemblyPublishFormAssemblyPage.card}>
            <BoardCardHeader
              subtitle="Solo quien esté aquí podrá ver el informe"
              title="4 · Lugar de la asamblea"
            />
            <div className={assemblyPublishFormAssemblyPage.fields}>
              <BoardInput
                error={errors.address}
                icon={
                  <MapPin aria-hidden="true" className={assemblyPublishFormAssemblyPage.pinIcon} />
                }
                id="assembly-address"
                label="Dirección"
                onChange={(event) => update("address", event.target.value)}
                value={values.address}
              />
              <BoardSelect
                id="assembly-radius"
                label="Radio permitido"
                onValueChange={(value) => update("radius", value)}
                options={radiusOptions}
                value={values.radius}
              />
              <BoardSwitchRow
                checked={values.requireLocation}
                hint="Se pide permiso de ubicación al abrir el informe. No se guarda."
                onCheckedChange={(checked) => update("requireLocation", checked)}
                title="Exigir ubicación del dispositivo"
              />
            </div>
          </BoardCard>
        </div>

        <AssemblyPublishSummary
          canCreate={parsed.success}
          onCreate={create}
          onSaveDraft={goToList}
          rows={[
            ["Código", values.accessCode],
            ["Vigencia", describeValidity(values.validFrom, values.validTo)],
            ["Apertura", values.manualEnable ? "Manual" : "Automática"],
            ["Lugar", radiusLabel],
          ]}
          title={report?.name ?? "Nueva publicación"}
        />
      </div>
    </div>
  );
}
