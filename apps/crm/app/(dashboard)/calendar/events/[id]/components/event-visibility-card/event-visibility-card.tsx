"use client";

import { EVENT_VISIBILITIES, type EventVisibility } from "@ancla/contracts";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormFooter,
  BoardFormSection,
  BoardFormSections,
  BoardSelect,
} from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { useEventRequest } from "../../hooks/useEventRequest";
import type { EventOption, EventRow, EventSettingsValues } from "../../types";
import { toEventSettingsBody, toEventSettingsValues } from "../../utils/eventSettingsValues";
import { EventOptionChips } from "../event-option-chips";

const CONFLICT_MESSAGE =
  "Otra persona cambió este evento mientras lo editabas. Recarga la página y vuelve a intentarlo.";

const VISIBILITY_LABELS: Record<EventVisibility, string> = {
  public: "Público: se ve en el sitio web",
  internal: "Interno: solo para ciertos roles",
};

const VISIBILITY_OPTIONS = EVENT_VISIBILITIES.map((visibility) => ({
  value: visibility,
  label: VISIBILITY_LABELS[visibility],
}));

interface EventVisibilityCardProps {
  event: EventRow;
  roles: readonly EventOption[];
  /** Only who can edit events may change who sees this one. */
  canEdit: boolean;
}

/** Visibility and audience: saved directly (not editorial), with the version read. */
export function EventVisibilityCard({ event, roles, canEdit }: EventVisibilityCardProps) {
  const [values, setValues] = useState<EventSettingsValues>(() => toEventSettingsValues(event));
  const { busy, run } = useEventRequest();
  const isInternal = values.visibility === "internal";

  async function submit(): Promise<void> {
    await run(
      () =>
        calendarApiClient.content.calendar.events[":id"].settings.$patch({
          param: { id: event.id },
          json: toEventSettingsBody(values, event.version),
        }),
      { success: "Visibilidad guardada", conflict: CONFLICT_MESSAGE },
    );
  }

  return (
    <BoardFormCard
      subtitle="Quién puede ver el evento. Se guarda al instante, sin revisión."
      title="Visibilidad y audiencia"
    >
      <BoardFormSections>
        <BoardFormSection>
          <BoardSelect
            disabled={!canEdit}
            id="event-visibility"
            label="Visibilidad"
            onValueChange={(visibility) =>
              setValues((previous) => ({ ...previous, visibility: visibility as EventVisibility }))
            }
            options={VISIBILITY_OPTIONS}
            value={values.visibility}
          />
          {isInternal ? (
            <EventOptionChips
              disabled={!canEdit}
              emptyText="No hay roles para elegir."
              hint={
                values.audienceRoleIds.length === 0
                  ? "Sin roles elegidos, solo el administrador lo verá."
                  : "Solo estos roles (y el administrador) verán el evento."
              }
              label="Roles con acceso"
              onChange={(audienceRoleIds) =>
                setValues((previous) => ({ ...previous, audienceRoleIds }))
              }
              options={roles}
              selectedIds={values.audienceRoleIds}
            />
          ) : null}
        </BoardFormSection>
      </BoardFormSections>
      {canEdit ? (
        <BoardFormFooter>
          <BoardButton
            data-testid="event-settings-save"
            disabled={busy}
            onClick={() => void submit()}
            variant="primary"
          >
            {busy ? "Guardando…" : "Guardar visibilidad"}
          </BoardButton>
        </BoardFormFooter>
      ) : null}
    </BoardFormCard>
  );
}
