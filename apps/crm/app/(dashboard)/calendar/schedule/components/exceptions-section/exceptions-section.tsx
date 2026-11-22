"use client";

import type { ScheduleExceptionDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { ScheduleSetOption, SiteLocales } from "../../types";
import { formatCalendarDate } from "../../utils/describeValidity";
import { pickTranslated } from "../../utils/translatedText";
import { ExceptionForm } from "../exception-form";
import { ExceptionRow } from "../exception-row";

const exceptionsSectionSchedulePage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

const NEW_EXCEPTION = "new";
const NO_MEETING_LABEL = "Sin reunión";
const UNKNOWN_SET_LABEL = "Horario eliminado";

interface ExceptionsSectionProps {
  exceptions: readonly ScheduleExceptionDto[];
  sets: readonly ScheduleSetOption[];
  site: SiteLocales;
  canEdit: boolean;
}

/** The dates the regular schedule does not apply to: no meeting, or another schedule set. */
export function ExceptionsSection({ exceptions, sets, site, canEdit }: ExceptionsSectionProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useCalendarRequest();
  const finish = () => setEditing(null);
  const setNames = new Map(sets.map((set) => [set.id, set.name]));
  const ordered = [...exceptions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <BoardCard data-testid="schedule-exceptions-card">
      <BoardCardHeader
        action={
          canEdit && editing === null ? (
            <BoardButton
              data-testid="exception-new"
              onClick={() => setEditing(NEW_EXCEPTION)}
              variant="primary"
            >
              <Plus aria-hidden="true" className={exceptionsSectionSchedulePage.icon} />
              Nueva excepción
            </BoardButton>
          ) : null
        }
        subtitle="Un día suelto con otro horario o sin reunión. Gana sobre cualquier horario."
        title="Excepciones"
      />
      {editing === NEW_EXCEPTION ? (
        <ExceptionForm exception={null} onDone={finish} sets={sets} site={site} />
      ) : null}
      {ordered.length === 0 && editing === null ? (
        <p className={exceptionsSectionSchedulePage.empty}>Todavía no hay excepciones.</p>
      ) : (
        <div className={exceptionsSectionSchedulePage.list}>
          {ordered.map((exception) =>
            editing === exception.id ? (
              <ExceptionForm
                exception={exception}
                key={exception.id}
                onDone={finish}
                sets={sets}
                site={site}
              />
            ) : (
              <ExceptionRow
                canEdit={canEdit}
                date={formatCalendarDate(exception.date)}
                disabled={busy}
                key={exception.id}
                message={pickTranslated(
                  exception.translations,
                  (translation) => translation.message,
                  site.defaultLocale,
                  "",
                )}
                noMeeting={exception.replacementSetId === null}
                onDelete={() =>
                  void run(
                    () =>
                      calendarApiClient.content.calendar.exceptions[":id"].$delete({
                        param: { id: exception.id },
                      }),
                    "Excepción eliminada",
                  )
                }
                onEdit={() => setEditing(exception.id)}
                outcome={
                  exception.replacementSetId === null
                    ? NO_MEETING_LABEL
                    : (setNames.get(exception.replacementSetId) ?? UNKNOWN_SET_LABEL)
                }
                testId={`schedule-exception-row-${exception.id}`}
              />
            ),
          )}
        </div>
      )}
    </BoardCard>
  );
}
