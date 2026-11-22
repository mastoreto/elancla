"use client";

import type { RecurringActivityDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardFormFooter } from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { MinistryOption, PlaceOption, SiteLocales } from "../../types";
import {
  hasActivityErrors,
  toActivityFormValues,
  toUpdateActivityBody,
  toUpsertActivityBody,
  validateActivityForm,
} from "../../utils/activityFormValues";
import { ActivityFormFields } from "../activity-form-fields";

const activityFormSchedulePage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

interface ActivityFormProps {
  /** `null` creates a new activity in the selected set. */
  activity: RecurringActivityDto | null;
  scheduleSetId: string;
  site: SiteLocales;
  places: readonly PlaceOption[];
  ministries: readonly MinistryOption[];
  onDone: () => void;
}

/** Create or edit one activity of a schedule set. Saving clears its "a revisar" mark. */
export function ActivityForm({
  activity,
  scheduleSetId,
  site,
  places,
  ministries,
  onDone,
}: ActivityFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toActivityFormValues(activity, locales));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useCalendarRequest();
  const errors = validateActivityForm(values, defaultLocale);

  async function submit(): Promise<void> {
    if (hasActivityErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.titles[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const response = await run(
      () =>
        activity
          ? calendarApiClient.content.calendar.activities[":id"].$patch({
              param: { id: activity.id },
              json: toUpdateActivityBody(values, scheduleSetId, {
                defaultLocale,
                version: activity.version,
              }),
            })
          : calendarApiClient.content.calendar.activities.$post({
              json: toUpsertActivityBody(values, scheduleSetId, defaultLocale),
            }),
      activity ? "Actividad actualizada" : "Actividad creada",
    );
    if (response) onDone();
  }

  return (
    <div className={activityFormSchedulePage.container} data-testid="activity-form">
      <ActivityFormFields
        activeLocale={activeLocale}
        errors={errors}
        ministries={ministries}
        onActiveLocaleChange={setActiveLocale}
        onChange={(patch) => setValues({ ...values, ...patch })}
        places={places}
        showErrors={showErrors}
        site={site}
        values={values}
      />
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="activity-save"
          disabled={busy}
          onClick={() => void submit()}
          variant="primary"
        >
          {busy ? "Guardando…" : "Guardar"}
        </BoardButton>
      </BoardFormFooter>
    </div>
  );
}
