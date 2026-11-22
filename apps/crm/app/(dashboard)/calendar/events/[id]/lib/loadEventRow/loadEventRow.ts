import type { CalendarYearDto } from "@ancla/contracts";
import { notFound } from "next/navigation";
import type { ServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import type { EventRow } from "../../types";

const FORBIDDEN = 403;

export interface LoadedEventRow {
  event: EventRow;
  calendarYear: CalendarYearDto;
}

async function loadYears(api: ServerCalendarApiClient): Promise<CalendarYearDto[]> {
  const response = await api.content.calendar.years.$get();
  if (response.status === FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the calendar years (${response.status})`);
  return (await response.json()).items;
}

async function findInYear(
  api: ServerCalendarApiClient,
  year: number,
  id: string,
): Promise<EventRow | null> {
  const response = await api.content.calendar.events.$get({ query: { year: String(year) } });
  if (!response.ok) throw new Error(`Could not load the events of ${year} (${response.status})`);
  return (await response.json()).items.find((item) => item.id === id) ?? null;
}

/** The year the list hint names comes first; the rest go from the newest to the oldest. */
function yearsToSearch(years: readonly CalendarYearDto[], hint: number | null): number[] {
  const newestFirst = years.map((item) => item.year).sort((a, b) => b - a);
  if (hint === null || !newestFirst.includes(hint)) return newestFirst;
  return [hint, ...newestFirst.filter((year) => year !== hint)];
}

/**
 * The row of an event (visibility, audience, version, year) and its year. There is no
 * `GET /content/calendar/events/:id`, so it is looked up in the list of the year the list link
 * pointed at (`yearHint`) and, failing that, in every year. Not found, or an internal event the
 * user cannot see, is a 404.
 */
export async function loadEventRow(
  api: ServerCalendarApiClient,
  id: string,
  yearHint: number | null,
): Promise<LoadedEventRow> {
  const years = await loadYears(api);
  for (const year of yearsToSearch(years, yearHint)) {
    const event = await findInYear(api, year, id);
    const calendarYear = years.find((item) => item.year === year);
    if (event && calendarYear) return { event, calendarYear };
  }
  notFound();
}
