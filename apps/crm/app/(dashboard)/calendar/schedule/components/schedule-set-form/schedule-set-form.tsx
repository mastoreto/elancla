"use client";

import { SCHEDULE_SET_NAME_MAX_LENGTH, type ScheduleSetDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardInput,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { SiteLocales } from "../../types";
import {
  hasScheduleSetErrors,
  toScheduleSetFormValues,
  toUpdateScheduleSetBody,
  toUpsertScheduleSetBody,
  validateScheduleSetForm,
} from "../../utils/scheduleSetFormValues";
import { incompleteLocales } from "../../utils/translatedText";

const scheduleSetFormSchedulePage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

interface ScheduleSetFormProps {
  /** `null` creates a new set. */
  set: ScheduleSetDto | null;
  site: SiteLocales;
  /** Orders of the existing sets: a new one goes after them. */
  existingOrders: readonly number[];
  onDone: () => void;
}

/** Create or edit one schedule set: name by language, validity, flags and order. */
export function ScheduleSetForm({ set, site, existingOrders, onDone }: ScheduleSetFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toScheduleSetFormValues(set, locales, existingOrders));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useCalendarRequest();
  const errors = validateScheduleSetForm(values, defaultLocale);

  async function submit(): Promise<void> {
    if (hasScheduleSetErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.names[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const response = await run(
      () =>
        set
          ? calendarApiClient.content.calendar["schedule-sets"][":id"].$patch({
              param: { id: set.id },
              json: toUpdateScheduleSetBody(values, defaultLocale, set.version),
            })
          : calendarApiClient.content.calendar["schedule-sets"].$post({
              json: toUpsertScheduleSetBody(values, defaultLocale),
            }),
      set ? "Horario actualizado" : "Horario creado",
    );
    if (response) onDone();
  }

  return (
    <div className={scheduleSetFormSchedulePage.container} data-testid="schedule-set-form">
      <BoardFormSection>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales(values.names, locales)}
          label="Idioma del horario"
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        <BoardInput
          data-testid="schedule-set-name"
          error={showErrors ? errors.names[activeLocale] : undefined}
          id={`schedule-set-name-${activeLocale}`}
          label="Nombre"
          maxLength={SCHEDULE_SET_NAME_MAX_LENGTH}
          onChange={(event) =>
            setValues({ ...values, names: { ...values.names, [activeLocale]: event.target.value } })
          }
          value={values.names[activeLocale] ?? ""}
        />
        <BoardFormRow columns={3}>
          <BoardInput
            error={showErrors ? errors.validFrom : undefined}
            hint="Vacío: sin fecha de inicio."
            id="schedule-set-valid-from"
            label="Vigente desde"
            onChange={(event) => setValues({ ...values, validFrom: event.target.value })}
            type="date"
            value={values.validFrom}
          />
          <BoardInput
            error={showErrors ? errors.validTo : undefined}
            hint="Vacío: sin fecha de fin."
            id="schedule-set-valid-to"
            label="Vigente hasta"
            onChange={(event) => setValues({ ...values, validTo: event.target.value })}
            type="date"
            value={values.validTo}
          />
          <BoardInput
            error={showErrors ? errors.order : undefined}
            hint="Los números más bajos salen primero."
            id="schedule-set-order"
            inputMode="numeric"
            label="Orden"
            onChange={(event) => setValues({ ...values, order: event.target.value })}
            value={values.order}
          />
        </BoardFormRow>
        <BoardSwitchRow
          checked={values.isDefault}
          hint="El que se usa cuando ningún otro aplica. Solo uno: al activarlo se lo quita al actual."
          onCheckedChange={(isDefault) => setValues({ ...values, isDefault })}
          title="Predeterminado"
        />
        <BoardSwitchRow
          checked={values.forcedActive}
          hint="Gana sobre las vigencias hasta que lo apagues. Solo uno a la vez."
          onCheckedChange={(forcedActive) => setValues({ ...values, forcedActive })}
          title="Forzar este horario"
        />
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="schedule-set-save"
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
