"use client";

import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormFooter,
  BoardFormSection,
  BoardFormSections,
} from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { OptionChecklist } from "../../../components/option-checklist";
import { useSaveReminders } from "../../hooks/useSaveReminders";
import type { ReminderSources } from "../../lib/loadReminderSources";
import type { ReminderFormValues } from "../../types";
import { formatLastSent } from "../../utils/formatLastSent";
import {
  reminderFormChanged,
  toReminderFormValues,
  validateReminderForm,
} from "../../utils/reminderFormValues";

const remindersPageContentCalendarPage = {
  explanation: cn("flex flex-col gap-2 text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  lastSent: cn("text-[13px] font-bold text-foreground"),
  notice: cn(
    "rounded-[18px] bg-[var(--oro-50)] px-4 py-3.5 text-[13px] leading-normal text-[var(--tinta-suave)]",
  ),
};

interface RemindersPageContentProps {
  sources: ReminderSources;
}

/** Who gets the yearly calendar reminder emails: roles (all their users) and individual people. */
export function RemindersPageContent({ sources }: RemindersPageContentProps) {
  const { settings, roles, users } = sources;
  const [saved, setSaved] = useState<ReminderFormValues>(() =>
    toReminderFormValues(settings, {
      roleIds: roles?.map(({ id }) => id) ?? null,
      userIds: users?.map(({ id }) => id) ?? null,
    }),
  );
  const [values, setValues] = useState<ReminderFormValues>(saved);
  const { busy, save } = useSaveReminders();
  const errors = validateReminderForm(values);
  const hasErrors = Boolean(errors.recipientRoleIds || errors.recipientUserIds);

  async function submit(): Promise<void> {
    if (hasErrors) return;
    if (await save(values)) setSaved(values);
  }

  return (
    <BoardFormCard
      subtitle="Un correo que recuerda dejar listo el calendario del año que viene."
      title="Recordatorios del calendario"
    >
      <BoardFormSections>
        <BoardFormSection>
          <div className={remindersPageContentCalendarPage.explanation}>
            <p>
              Desde el 1 de diciembre se envía un recordatorio cada 2 días, hasta que el año
              siguiente esté publicado y sus actividades con revisión anual estén confirmadas.
            </p>
            <p className={remindersPageContentCalendarPage.lastSent}>
              {formatLastSent(settings.lastSentOn)}
            </p>
          </div>
          {roles === null ? null : (
            <OptionChecklist
              emptyText="No hay roles para elegir."
              error={errors.recipientRoleIds}
              legend="Roles (reciben el correo todas las personas con ese rol)"
              onChange={(recipientRoleIds) => setValues({ ...values, recipientRoleIds })}
              options={roles.map(({ id, name }) => ({ value: id, label: name }))}
              selected={values.recipientRoleIds}
            />
          )}
          {users === null ? (
            <p className={remindersPageContentCalendarPage.notice}>
              Tu rol no puede ver la lista de personas: solo se muestran los roles. Las personas ya
              elegidas se conservan.
            </p>
          ) : (
            <OptionChecklist
              emptyText="No hay personas para elegir."
              error={errors.recipientUserIds}
              legend="Personas"
              onChange={(recipientUserIds) => setValues({ ...values, recipientUserIds })}
              options={users.map(({ id, name, hint }) => ({ value: id, label: name, hint }))}
              selected={values.recipientUserIds}
            />
          )}
          <p className={remindersPageContentCalendarPage.notice}>
            Si no eliges a nadie, el aviso llega a los administradores.
          </p>
        </BoardFormSection>
      </BoardFormSections>
      <BoardFormFooter>
        <BoardButton
          data-testid="save-reminders"
          disabled={busy || hasErrors || !reminderFormChanged(saved, values)}
          onClick={() => void submit()}
          variant="primary"
        >
          {busy ? "Guardando…" : "Guardar destinatarios"}
        </BoardButton>
      </BoardFormFooter>
    </BoardFormCard>
  );
}
