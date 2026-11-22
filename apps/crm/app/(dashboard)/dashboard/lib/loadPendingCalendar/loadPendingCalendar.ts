import type { CalendarPendingDto } from "@ancla/contracts";
import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";

/**
 * What the calendar still needs before the year about to start is ready. The dashboard must never
 * break because of it: a role that cannot read the calendar, or any failure, gives `null`.
 */
export async function loadPendingCalendar(): Promise<CalendarPendingDto | null> {
  try {
    const api = await createServerCalendarApiClient();
    const response = await api.content.calendar.pending.$get();
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
