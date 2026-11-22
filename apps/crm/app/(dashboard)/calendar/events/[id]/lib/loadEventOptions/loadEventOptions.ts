import { pickLocalized } from "@/app/(dashboard)/ministries/utils/pickLocalized";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import type { ServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import type { EventOption } from "../../types";

export interface EventOptions {
  ministries: EventOption[];
  places: EventOption[];
  roles: EventOption[];
}

interface LoadEventOptionsInput {
  api: ServerApiClient;
  calendarApi: ServerCalendarApiClient;
  defaultLocale: string;
  /** Roles are only needed (and only readable) by who can edit the visibility. */
  includeRoles: boolean;
}

// ponytail: a role that can edit events but cannot read ministries (or roles) gets that list
// empty instead of a broken page; the API still validates every id it receives.
async function loadMinistries(api: ServerApiClient): Promise<EventOption[]> {
  const response = await api.content.ministries.$get();
  if (!response.ok) return [];
  return (await response.json()).items.map(({ id, name }) => ({ id, label: name }));
}

async function loadPlaces(
  calendarApi: ServerCalendarApiClient,
  defaultLocale: string,
): Promise<EventOption[]> {
  const response = await calendarApi.content.calendar.places.$get();
  if (!response.ok) return [];
  return (await response.json()).items.map(({ id, translations }) => ({
    id,
    label: pickLocalized(translations, defaultLocale),
  }));
}

async function loadRoles(api: ServerApiClient, include: boolean): Promise<EventOption[]> {
  if (!include) return [];
  const response = await api.roles.$get();
  if (!response.ok) return [];
  return (await response.json()).map(({ id, name }) => ({ id, label: name }));
}

/** The choices of the event form: ministries, places and (for the visibility card) roles. */
export async function loadEventOptions({
  api,
  calendarApi,
  defaultLocale,
  includeRoles,
}: LoadEventOptionsInput): Promise<EventOptions> {
  const [ministries, places, roles] = await Promise.all([
    loadMinistries(api),
    loadPlaces(calendarApi, defaultLocale),
    loadRoles(api, includeRoles),
  ]);
  return { ministries, places, roles };
}
