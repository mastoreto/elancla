import { CirclePause, CirclePlay, Clock3, Trash2 } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import { PLACE_SAMPLE } from "../data/assembly-panel-samples";
import type { AssemblyReport } from "../types";
import { type AssemblyPanelMode, getLifecycleIndex } from "../utils/assembly-view";
import { AssemblyLifecycle } from "./assembly-lifecycle";
import { AssemblyStatusPill } from "./assembly-status-pill";
import { AssemblyTakedownDialog } from "./assembly-takedown-dialog";

const assemblyAccessCardAssemblyPage = {
  card: cn("p-6"),
  body: cn("flex flex-col gap-4"),
  box: cn("flex items-center gap-3.5 rounded-[22px] px-[18px] py-4"),
  boxOpen: cn("bg-[var(--vida-50)]"),
  boxClosed: cn("bg-[var(--oro-50)]"),
  boxEnded: cn("bg-secondary"),
  bubble: cn("size-11"),
  icon: cn("size-5"),
  boxText: cn("flex flex-1 flex-col gap-0.5"),
  boxTitleOpen: cn("font-display text-[26px] font-semibold text-[var(--vida)] tabular-nums"),
  boxTitle: cn("font-display text-lg font-semibold"),
  boxHint: cn("text-[12.5px] leading-snug text-[var(--tinta-suave)]"),
  actions: cn("flex gap-2.5"),
  action: cn("w-full"),
  buttonIcon: cn("size-4"),
  hint: cn("text-[12.5px] leading-normal text-[var(--tinta-apagada)]"),
};

interface AssemblyAccessCardProps {
  report: AssemblyReport;
  mode: AssemblyPanelMode;
  onEnable: () => void;
  onDisable: () => void;
  onTakeDown: () => void;
}

export function AssemblyAccessCard({
  report,
  mode,
  onEnable,
  onDisable,
  onTakeDown,
}: AssemblyAccessCardProps) {
  const subtitle = {
    open: `Habilitado desde las ${PLACE_SAMPLE.enabledAt}`,
    closed: "Aún nadie puede ver el informe",
    ended: "El acceso ya no está disponible",
  }[mode];

  const takeDown = (
    <AssemblyTakedownDialog
      code={report.accessCode}
      connected={mode === "open" ? PLACE_SAMPLE.connected : 0}
      onConfirm={onTakeDown}
      trigger={
        <BoardButton className={assemblyAccessCardAssemblyPage.action} variant="soft">
          <Trash2 aria-hidden="true" className={assemblyAccessCardAssemblyPage.buttonIcon} />
          Dar de baja
        </BoardButton>
      }
    />
  );

  return (
    <BoardCard className={assemblyAccessCardAssemblyPage.card}>
      <BoardCardHeader
        action={<AssemblyStatusPill status={report.status} />}
        subtitle={subtitle}
        title="Control de acceso"
      />
      <div className={assemblyAccessCardAssemblyPage.body}>
        {mode === "open" ? (
          <div
            className={cn(
              assemblyAccessCardAssemblyPage.box,
              assemblyAccessCardAssemblyPage.boxOpen,
            )}
          >
            <IconBubble className={assemblyAccessCardAssemblyPage.bubble} tone="green">
              <Clock3 aria-hidden="true" className={assemblyAccessCardAssemblyPage.icon} />
            </IconBubble>
            <div className={assemblyAccessCardAssemblyPage.boxText}>
              <b className={assemblyAccessCardAssemblyPage.boxTitleOpen}>
                {PLACE_SAMPLE.remaining}
              </b>
              <span className={assemblyAccessCardAssemblyPage.boxHint}>
                restantes · cierra hoy a las {PLACE_SAMPLE.closesAt}
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              assemblyAccessCardAssemblyPage.box,
              mode === "closed"
                ? assemblyAccessCardAssemblyPage.boxClosed
                : assemblyAccessCardAssemblyPage.boxEnded,
            )}
          >
            <IconBubble
              className={assemblyAccessCardAssemblyPage.bubble}
              tone={mode === "closed" ? "gold" : "ink"}
            >
              <Clock3 aria-hidden="true" className={assemblyAccessCardAssemblyPage.icon} />
            </IconBubble>
            <div className={assemblyAccessCardAssemblyPage.boxText}>
              <b className={assemblyAccessCardAssemblyPage.boxTitle}>
                {mode === "closed" ? "Listo para proyectar" : report.status}
              </b>
              <span className={assemblyAccessCardAssemblyPage.boxHint}>
                {mode === "closed"
                  ? "Puedes compartir el código y mostrar el QR ahora; se abrirá cuando lo habilites."
                  : `Vigencia: ${report.validity}.`}
              </span>
            </div>
          </div>
        )}

        <AssemblyLifecycle currentIndex={getLifecycleIndex(report.status)} />

        {mode === "open" ? (
          <>
            <div className={assemblyAccessCardAssemblyPage.actions}>
              <BoardButton
                className={assemblyAccessCardAssemblyPage.action}
                onClick={onDisable}
                variant="outline"
              >
                <CirclePause
                  aria-hidden="true"
                  className={assemblyAccessCardAssemblyPage.buttonIcon}
                />
                Deshabilitar acceso
              </BoardButton>
              {takeDown}
            </div>
            <span className={assemblyAccessCardAssemblyPage.hint}>
              Deshabilitar corta el acceso por ahora y puedes volver a abrirlo. Dar de baja es
              definitivo: el código mostrará que el informe ya no está disponible.
            </span>
          </>
        ) : null}
        {mode === "closed" ? (
          <>
            <div className={assemblyAccessCardAssemblyPage.actions}>
              <BoardButton
                className={assemblyAccessCardAssemblyPage.action}
                onClick={onEnable}
                variant="primary"
              >
                <CirclePlay
                  aria-hidden="true"
                  className={assemblyAccessCardAssemblyPage.buttonIcon}
                />
                Habilitar acceso ahora
              </BoardButton>
            </div>
            <span className={assemblyAccessCardAssemblyPage.hint}>
              Vigencia: {report.validity.toLowerCase()}. Fuera de ese horario el informe no se abre
              aunque lo habilites.
            </span>
          </>
        ) : null}
      </div>
    </BoardCard>
  );
}
