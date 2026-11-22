"use client";

import { EXCEPTION_MESSAGE_MAX_LENGTH, type ScheduleExceptionDto } from "@ancla/contracts";
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
  BoardSelect,
} from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { ScheduleSetOption, SiteLocales } from "../../types";
import {
  hasExceptionErrors,
  toExceptionFormValues,
  toUpdateExceptionBody,
  toUpsertExceptionBody,
  validateExceptionForm,
} from "../../utils/exceptionFormValues";
import { incompleteLocales } from "../../utils/translatedText";

const exceptionFormSchedulePage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

/** A select cannot hold an empty value, so "no meeting" travels as this one. */
const NO_MEETING = "none";

interface ExceptionFormProps {
  /** `null` creates a new exception. */
  exception: ScheduleExceptionDto | null;
  /** The sets that can replace the regular one that day. */
  sets: readonly ScheduleSetOption[];
  site: SiteLocales;
  onDone: () => void;
}

/** Create or edit one exception: a date, the message by language and what replaces the schedule. */
export function ExceptionForm({ exception, sets, site, onDone }: ExceptionFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toExceptionFormValues(exception, locales));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useCalendarRequest();
  const errors = validateExceptionForm(values, defaultLocale);
  const replacementOptions = [
    { value: NO_MEETING, label: "Sin reunión" },
    ...sets.map((set) => ({ value: set.id, label: `Reemplazar por «${set.name}»` })),
  ];

  async function submit(): Promise<void> {
    if (hasExceptionErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.messages[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const response = await run(
      () =>
        exception
          ? calendarApiClient.content.calendar.exceptions[":id"].$patch({
              param: { id: exception.id },
              json: toUpdateExceptionBody(values, defaultLocale, exception.version),
            })
          : calendarApiClient.content.calendar.exceptions.$post({
              json: toUpsertExceptionBody(values, defaultLocale),
            }),
      exception ? "Excepción actualizada" : "Excepción creada",
    );
    if (response) onDone();
  }

  return (
    <div className={exceptionFormSchedulePage.container} data-testid="exception-form">
      <BoardFormSection>
        <BoardFormRow>
          <BoardInput
            error={showErrors ? errors.date : undefined}
            id="exception-date"
            label="Fecha"
            onChange={(event) => setValues({ ...values, date: event.target.value })}
            type="date"
            value={values.date}
          />
          <BoardSelect
            id="exception-replacement"
            label="Ese día"
            onValueChange={(id) =>
              setValues({ ...values, replacementSetId: id === NO_MEETING ? "" : id })
            }
            options={replacementOptions}
            value={values.replacementSetId === "" ? NO_MEETING : values.replacementSetId}
          />
        </BoardFormRow>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales(values.messages, locales)}
          label="Idioma del mensaje"
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        <BoardInput
          error={showErrors ? errors.messages[activeLocale] : undefined}
          hint="Lo que verá la gente en el sitio ese día."
          id={`exception-message-${activeLocale}`}
          label="Mensaje"
          maxLength={EXCEPTION_MESSAGE_MAX_LENGTH}
          onChange={(event) =>
            setValues({
              ...values,
              messages: { ...values.messages, [activeLocale]: event.target.value },
            })
          }
          value={values.messages[activeLocale] ?? ""}
        />
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="exception-save"
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
