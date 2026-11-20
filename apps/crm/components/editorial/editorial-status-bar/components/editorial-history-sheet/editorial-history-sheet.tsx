"use client";

import type { EditorialContentTypeParam, RevisionSummaryDto } from "@ancla/contracts";
import { History } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { stateLabel, stateTone } from "../../utils";

const editorialHistorySheetEditorialPage = {
  icon: cn("size-4"),
  content: cn("w-full gap-0 overflow-y-auto sm:max-w-md"),
  list: cn("flex flex-col gap-3 px-4 pb-6"),
  item: cn("flex flex-col gap-1.5 rounded-[18px] bg-secondary p-3.5"),
  header: cn("flex items-center justify-between gap-2"),
  number: cn("font-display text-base font-medium"),
  meta: cn("text-[13px] text-[var(--tinta-suave)]"),
  comment: cn("text-[13px] text-foreground"),
  empty: cn("px-4 py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" });

type LoadState = "idle" | "loading" | "failed" | "ready";

interface EditorialHistorySheetProps {
  contentType: EditorialContentTypeParam;
  entityId: string;
}

/** Who wrote, reviewed and published each revision, loaded when the sheet opens. */
export function EditorialHistorySheet({ contentType, entityId }: EditorialHistorySheetProps) {
  const [revisions, setRevisions] = useState<RevisionSummaryDto[]>([]);
  const [load, setLoad] = useState<LoadState>("idle");

  async function fetchHistory(open: boolean) {
    if (!open) {
      return;
    }
    setLoad("loading");
    const response = await apiClient.editorial[":type"][":entityId"].history.$get({
      param: { type: contentType, entityId },
    });
    if (!response.ok) {
      setLoad("failed");
      return;
    }
    setRevisions(await response.json());
    setLoad("ready");
  }

  return (
    <Sheet onOpenChange={(open) => void fetchHistory(open)}>
      <SheetTrigger asChild={true}>
        <BoardButton size="sm" variant="ghost">
          <History aria-hidden="true" className={editorialHistorySheetEditorialPage.icon} />
          Historial
        </BoardButton>
      </SheetTrigger>
      <SheetContent className={editorialHistorySheetEditorialPage.content}>
        <SheetHeader>
          <SheetTitle>Historial</SheetTitle>
          <SheetDescription>Todas las versiones, de la más nueva a la más vieja.</SheetDescription>
        </SheetHeader>
        {load === "loading" ? (
          <p className={editorialHistorySheetEditorialPage.empty}>Cargando…</p>
        ) : null}
        {load === "failed" ? (
          <p className={editorialHistorySheetEditorialPage.empty}>
            No se pudo cargar el historial.
          </p>
        ) : null}
        {load === "ready" && revisions.length === 0 ? (
          <p className={editorialHistorySheetEditorialPage.empty}>Todavía no hay versiones.</p>
        ) : null}
        <ol className={editorialHistorySheetEditorialPage.list}>
          {revisions.map((revision) => (
            <li className={editorialHistorySheetEditorialPage.item} key={revision.id}>
              <div className={editorialHistorySheetEditorialPage.header}>
                <span className={editorialHistorySheetEditorialPage.number}>
                  Versión {revision.number}
                </span>
                <StatusPill tone={stateTone(revision.state)}>
                  {stateLabel(revision.state)}
                </StatusPill>
              </div>
              <span className={editorialHistorySheetEditorialPage.meta}>
                {revision.author.name} · {dateFormat.format(new Date(revision.createdAt))}
              </span>
              {revision.reviewer ? (
                <span className={editorialHistorySheetEditorialPage.meta}>
                  Revisó {revision.reviewer.name}
                </span>
              ) : null}
              {revision.comment ? (
                <span className={editorialHistorySheetEditorialPage.comment}>
                  “{revision.comment}”
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
