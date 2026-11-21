"use client";

import type {
  EditorialActionDto,
  EditorialContentTypeParam,
  EditorialStatusDto,
} from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { EditorialHistorySheet } from "./components/editorial-history-sheet";
import { RequestChangesDialog } from "./components/request-changes-dialog";
import { actionLabel, describeEditorialFailure, stateLabel, stateTone } from "./utils";

const SUCCESS_MESSAGES: Record<EditorialActionDto, string> = {
  saveDraft: "Borrador guardado",
  submit: "Enviado a revisión",
  publish: "Contenido publicado",
  approve: "Contenido aprobado y publicado",
  requestChanges: "Cambios pedidos",
  pause: "Contenido pausado",
  resume: "Contenido reanudado",
};

const editorialStatusBarEditorialPage = {
  container: cn("flex flex-col gap-3.5 p-5"),
  badges: cn("flex flex-wrap items-center gap-2"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  comment: cn("rounded-[18px] bg-[var(--granada-50)] px-4 py-3 text-[13.5px] leading-normal"),
  actions: cn("flex flex-wrap items-center gap-2"),
};

interface EditorialStatusBarProps {
  contentType: EditorialContentTypeParam;
  entityId: string;
  status: EditorialStatusDto;
  /** The current content of the editor; without it the draft cannot be saved from here. */
  getSnapshot?: () => Record<string, unknown>;
  /** The page may have its own, validated "save draft" button. Defaults to showing the bar's. */
  showSaveDraft?: boolean;
  className?: string;
}

/**
 * The state of a content entity and one button per thing the user can do now. It paints what the
 * API says in `availableActions` and re-implements no rule: the pages of 1.4 and 1.5 mount it.
 */
export function EditorialStatusBar({
  contentType,
  entityId,
  status,
  getSnapshot,
  showSaveDraft = true,
  className,
}: EditorialStatusBarProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const param = { type: contentType, entityId };
  const entity = apiClient.editorial[":type"][":entityId"];

  function request(action: EditorialActionDto, comment?: string): Promise<Response> | null {
    switch (action) {
      case "saveDraft":
        return getSnapshot ? entity.draft.$put({ param, json: { snapshot: getSnapshot() } }) : null;
      case "submit":
        return entity.submit.$post({ param });
      // Resuming has no route of its own: publishing with nothing in progress resumes.
      case "publish":
      case "resume":
        return entity.publish.$post({ param });
      case "approve":
        return entity.approve.$post({ param });
      case "requestChanges":
        return entity["request-changes"].$post({ param, json: { comment: comment ?? "" } });
      case "pause":
        return entity.pause.$post({ param });
    }
  }

  // What the editor sees is what goes to review or live: unsaved edits are saved first.
  const savesFirst = (action: EditorialActionDto): boolean =>
    Boolean(getSnapshot) &&
    Boolean(status.working) &&
    status.availableActions.includes("saveDraft") &&
    (action === "submit" || action === "publish");

  async function run(action: EditorialActionDto, comment?: string) {
    setBusy(true);
    try {
      if (savesFirst(action) && getSnapshot) {
        const saved = await entity.draft.$put({ param, json: { snapshot: getSnapshot() } });
        if (!saved.ok) {
          toast.error(await describeEditorialFailure(saved));
          return;
        }
      }
      const response = await request(action, comment);
      if (!response) return;
      if (!response.ok) {
        toast.error(await describeEditorialFailure(response));
        return;
      }
      toast.success(SUCCESS_MESSAGES[action]);
      setChangesOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const actions = status.availableActions.filter(
    (action) => action !== "saveDraft" || (getSnapshot && showSaveDraft),
  );

  return (
    <BoardCard className={cn(editorialStatusBarEditorialPage.container, className)}>
      <div className={editorialStatusBarEditorialPage.badges}>
        <span className={editorialStatusBarEditorialPage.label}>En el sitio</span>
        {status.live ? (
          <StatusPill tone={stateTone(status.live.state)}>
            {stateLabel(status.live.state)}
          </StatusPill>
        ) : (
          <StatusPill tone="ink">Sin publicar</StatusPill>
        )}
        {status.working ? (
          <>
            <span className={editorialStatusBarEditorialPage.label}>Versión en curso</span>
            <StatusPill tone={stateTone(status.working.state)}>
              {stateLabel(status.working.state)}
            </StatusPill>
          </>
        ) : null}
      </div>

      {status.working?.state === "changes_requested" && status.working.comment ? (
        <p className={editorialStatusBarEditorialPage.comment}>
          {status.working.reviewer ? `${status.working.reviewer.name}: ` : ""}
          {status.working.comment}
        </p>
      ) : null}

      <div className={editorialStatusBarEditorialPage.actions}>
        {actions.map((action) => {
          if (action === "requestChanges") {
            return (
              <BoardButton
                disabled={busy}
                key={action}
                onClick={() => setChangesOpen(true)}
                variant="outline"
              >
                {actionLabel(action)}
              </BoardButton>
            );
          }
          if (action === "pause") {
            return (
              <BoardConfirmDialog
                confirmLabel="Pausar"
                description="El contenido deja de verse en el sitio público. Podrás reanudarlo cuando quieras."
                key={action}
                onConfirm={() => void run(action)}
                title="Pausar contenido"
                trigger={
                  <BoardButton disabled={busy} variant="outline">
                    {actionLabel(action)}
                  </BoardButton>
                }
              />
            );
          }
          return (
            <BoardButton
              disabled={busy}
              key={action}
              onClick={() => void run(action)}
              variant={action === "saveDraft" ? "outline" : "primary"}
            >
              {actionLabel(action)}
            </BoardButton>
          );
        })}
        <EditorialHistorySheet contentType={contentType} entityId={entityId} />
      </div>

      <RequestChangesDialog
        busy={busy}
        onOpenChange={setChangesOpen}
        onSubmit={(comment) => void run("requestChanges", comment)}
        open={changesOpen}
      />
    </BoardCard>
  );
}
