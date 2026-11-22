"use client";

import { EVENT_AUDIENCE_ROLES_MAX_COUNT, type EventVisibility } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardSelect } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useCalendarRequest } from "../../hooks/useCalendarRequest";
import type { CalendarRoleOption } from "../../types";
import { OptionChecklist } from "../option-checklist";

const newEventButtonCalendarPage = {
  form: cn("flex flex-col gap-4"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
  icon: cn("size-4"),
};

const PUBLIC_VISIBILITY_OPTIONS = [{ value: "public", label: "Pública (se ve en el sitio)" }];
const INTERNAL_VISIBILITY_OPTION = {
  value: "internal",
  label: "Interna (solo para algunos roles)",
};

interface NewEventButtonProps {
  year: number;
  /** Roles the audience can be picked from; `null` when the user cannot offer internal events. */
  roles: readonly CalendarRoleOption[] | null;
}

/** Asks for the row of the event (visibility and audience) and opens its editor. */
export function NewEventButton({ year, roles }: NewEventButtonProps) {
  const router = useRouter();
  const { busy, run } = useCalendarRequest();
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [audienceRoleIds, setAudienceRoleIds] = useState<string[]>([]);
  const visibilityOptions =
    roles === null
      ? PUBLIC_VISIBILITY_OPTIONS
      : [...PUBLIC_VISIBILITY_OPTIONS, INTERNAL_VISIBILITY_OPTION];
  const isInternal = visibility === "internal";

  async function create(): Promise<void> {
    const response = await run(
      () =>
        calendarApiClient.content.calendar.events.$post({
          json: { year, visibility, audienceRoleIds: isInternal ? audienceRoleIds : [] },
        }),
      "Evento creado.",
    );
    if (!response) return;
    const { id } = await response.json();
    setOpen(false);
    router.push(`${getChurchRoutePath("calendar", "events", id)}?year=${year}`);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <BoardButton data-testid="new-event-button" onClick={() => setOpen(true)} variant="primary">
        <Plus aria-hidden="true" className={newEventButtonCalendarPage.icon} />
        Nuevo evento
      </BoardButton>
      <BoardDialogContent
        description={`El evento se crea en el año ${year}. Su contenido se escribe en el editor.`}
        title="Nuevo evento"
      >
        <form
          className={newEventButtonCalendarPage.form}
          noValidate={true}
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <BoardSelect
            id="new-event-visibility"
            label="Visibilidad"
            onValueChange={(value) => setVisibility(value === "internal" ? "internal" : "public")}
            options={visibilityOptions}
            value={visibility}
          />
          {isInternal && roles !== null ? (
            <OptionChecklist
              emptyText="No hay roles para elegir."
              error={
                audienceRoleIds.length > EVENT_AUDIENCE_ROLES_MAX_COUNT
                  ? `Elige hasta ${EVENT_AUDIENCE_ROLES_MAX_COUNT} roles.`
                  : undefined
              }
              legend="Roles que lo ven (sin roles, solo la administración)"
              onChange={setAudienceRoleIds}
              options={roles.map((role) => ({ value: role.id, label: role.name }))}
              selected={audienceRoleIds}
            />
          ) : null}
          <div className={newEventButtonCalendarPage.footer}>
            <BoardButton disabled={busy} onClick={() => setOpen(false)} variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              data-testid="new-event-create"
              disabled={busy || audienceRoleIds.length > EVENT_AUDIENCE_ROLES_MAX_COUNT}
              onClick={() => void create()}
              variant="primary"
            >
              {busy ? "Creando…" : "Crear evento"}
            </BoardButton>
          </div>
        </form>
      </BoardDialogContent>
    </Dialog>
  );
}
