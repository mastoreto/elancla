"use client";

import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { useCalendarRequest } from "../../../hooks/useCalendarRequest";
import type { ReminderFormValues } from "../../types";
import { toReminderBody } from "../../utils/reminderFormValues";

interface UseSaveReminders {
  busy: boolean;
  save: (values: ReminderFormValues) => Promise<boolean>;
}

/** Saves the recipients of the reminder emails; toasts the outcome and refreshes the page. */
export function useSaveReminders(): UseSaveReminders {
  const { busy, run } = useCalendarRequest();

  async function save(values: ReminderFormValues): Promise<boolean> {
    const response = await run(
      () => calendarApiClient.content.calendar.reminders.$put({ json: toReminderBody(values) }),
      "Destinatarios guardados.",
    );
    return response !== null;
  }

  return { busy, save };
}
