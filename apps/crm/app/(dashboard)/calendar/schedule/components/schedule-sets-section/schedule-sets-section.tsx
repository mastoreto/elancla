"use client";

import type { ScheduleSetDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { SiteLocales } from "../../types";
import { describeValidity } from "../../utils/describeValidity";
import { toForcedActiveBody } from "../../utils/scheduleSetFormValues";
import { pickTranslated } from "../../utils/translatedText";
import { ScheduleSetCard } from "../schedule-set-card";
import { ScheduleSetForm } from "../schedule-set-form";

const scheduleSetsSectionSchedulePage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

const NEW_SET = "new";
const SET_QUERY_PARAM = "set";
const UNNAMED_SET = "Sin nombre";

interface ScheduleSetsSectionProps {
  sets: readonly ScheduleSetDto[];
  site: SiteLocales;
  selectedSetId: string | null;
  canEdit: boolean;
}

function setHref(setId: string): string {
  return `${getChurchRoutePath("calendar", "schedule")}?${SET_QUERY_PARAM}=${setId}`;
}

/** The schedule sets: validity, default, manual switch, and the forms to create and edit them. */
export function ScheduleSetsSection({
  sets,
  site,
  selectedSetId,
  canEdit,
}: ScheduleSetsSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useCalendarRequest();
  const finish = () => setEditing(null);
  const orders = sets.map((set) => set.order);

  return (
    <BoardCard data-testid="schedule-sets-card">
      <BoardCardHeader
        action={
          canEdit && editing === null ? (
            <BoardButton
              data-testid="schedule-set-new"
              onClick={() => setEditing(NEW_SET)}
              variant="primary"
            >
              <Plus aria-hidden="true" className={scheduleSetsSectionSchedulePage.icon} />
              Nuevo horario
            </BoardButton>
          ) : null
        }
        subtitle="Cada horario es un conjunto de actividades semanales. Elige uno para ver y editar sus actividades."
        title="Horarios"
      />
      {editing === NEW_SET ? (
        <ScheduleSetForm existingOrders={orders} onDone={finish} set={null} site={site} />
      ) : null}
      {sets.length === 0 && editing === null ? (
        <p className={scheduleSetsSectionSchedulePage.empty}>Todavía no hay horarios.</p>
      ) : (
        <div className={scheduleSetsSectionSchedulePage.list}>
          {sets.map((set) =>
            editing === set.id ? (
              <ScheduleSetForm
                existingOrders={orders}
                key={set.id}
                onDone={finish}
                set={set}
                site={site}
              />
            ) : (
              <ScheduleSetCard
                canEdit={canEdit}
                disabled={busy}
                forcedActive={set.forcedActive}
                href={setHref(set.id)}
                isDefault={set.isDefault}
                key={set.id}
                name={pickTranslated(
                  set.translations,
                  (translation) => translation.name,
                  site.defaultLocale,
                  UNNAMED_SET,
                )}
                onDelete={() =>
                  void run(
                    () =>
                      calendarApiClient.content.calendar["schedule-sets"][":id"].$delete({
                        param: { id: set.id },
                      }),
                    "Horario eliminado",
                  )
                }
                onEdit={() => setEditing(set.id)}
                onToggleForced={(forcedActive) =>
                  void run(
                    () =>
                      calendarApiClient.content.calendar["schedule-sets"][":id"].$patch({
                        param: { id: set.id },
                        json: toForcedActiveBody(set, forcedActive),
                      }),
                    forcedActive ? "Horario forzado" : "Horario ya no forzado",
                  )
                }
                selected={set.id === selectedSetId}
                testId={`schedule-set-row-${set.id}`}
                validity={describeValidity(set.validFrom, set.validTo)}
              />
            ),
          )}
        </div>
      )}
    </BoardCard>
  );
}
