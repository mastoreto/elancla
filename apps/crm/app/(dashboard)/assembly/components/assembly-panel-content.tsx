"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { PLACE_SAMPLE } from "../data/assembly-panel-samples";
import type { AssemblyReport, AssemblyReportStatus } from "../types";
import { getPanelMode } from "../utils/assembly-view";
import { AssemblyAccessCard } from "./assembly-access-card";
import { AssemblyActivityCard } from "./assembly-activity-card";
import { AssemblyPanelHero } from "./assembly-panel-hero";
import { AssemblyPlaceCard } from "./assembly-place-card";

const assemblyPanelContentAssemblyPage = {
  page: cn("flex flex-col gap-5"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] lg:grid-cols-3"),
};

/** Open/close and take-down are local state until the Assembly API exists. */
export function AssemblyPanelContent({ report }: { report: AssemblyReport }) {
  const router = useRouter();
  const [status, setStatus] = useState<AssemblyReportStatus>(report.status);
  const current = { ...report, status };
  const mode = getPanelMode(status);

  const copyCode = () => navigator.clipboard?.writeText(report.accessCode).catch(() => undefined);
  const takeDown = () => {
    setStatus("Dado de baja");
    router.push(getChurchRoutePath("assembly"));
  };

  return (
    <div className={assemblyPanelContentAssemblyPage.page}>
      <AssemblyPanelHero mode={mode} onCopyCode={copyCode} report={current} statusLabel={status} />

      {mode === "closed" ? (
        <StatCardGrid>
          <StatCard
            detail="Vieron «aún no disponible»"
            highlighted={true}
            label="Intentos de acceso"
            value={String(PLACE_SAMPLE.closedAttempts)}
          />
          <StatCard detail="Se abre al habilitar" label="Accesos concedidos" value="0" />
          <StatCard detail={report.validity} label="Vigencia" value={PLACE_SAMPLE.closedDuration} />
          <StatCard detail={report.place} label="Lugar" value={PLACE_SAMPLE.radius} />
        </StatCardGrid>
      ) : (
        <StatCardGrid>
          <StatCard
            detail={`De ${report.accesses} accesos concedidos`}
            highlighted={true}
            label="Conectados ahora"
            value={String(mode === "open" ? PLACE_SAMPLE.connected : 0)}
          />
          <StatCard
            detail={`Desde las ${PLACE_SAMPLE.enabledAt}`}
            label="Accesos concedidos"
            value={String(report.accesses)}
          />
          <StatCard
            detail="Fuera del radio permitido"
            label="Bloqueados por ubicación"
            value={String(report.blocked)}
          />
          <StatCard
            detail="Según acreditación"
            label="Quórum presente"
            value={PLACE_SAMPLE.quorum}
          />
        </StatCardGrid>
      )}

      <div className={assemblyPanelContentAssemblyPage.columns}>
        <AssemblyAccessCard
          mode={mode}
          onDisable={() => setStatus("Sin habilitar")}
          onEnable={() => setStatus("Abierto")}
          onTakeDown={takeDown}
          report={current}
        />
        <AssemblyPlaceCard report={current} />
        <AssemblyActivityCard mode={mode} />
      </div>
    </div>
  );
}
