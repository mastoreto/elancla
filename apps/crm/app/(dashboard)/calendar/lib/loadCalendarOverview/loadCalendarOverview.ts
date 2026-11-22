import {
  type CalendarPendingDto,
  type CalendarYearDto,
  type EventListItemDto,
  PERMISSIONS,
} from "@ancla/contracts";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import {
  createServerCalendarApiClient,
  type ServerCalendarApiClient,
} from "@/lib/api/createServerCalendarApiClient";
import { type AccessSnapshot, can } from "@/lib/authz/can";
// ponytail: shared with the people, pages, blog and ministries screens; it moves to `lib` if a sixth needs it.
import { loadSiteLocales } from "../../../website/people/lib/loadSiteLocales";
import type { CalendarMinistry, CalendarRoleOption } from "../../types";
import { resolveSelectedYear } from "../../utils/resolveSelectedYear";

const HTTP_FORBIDDEN = 403;

export interface CalendarOverview {
  years: readonly CalendarYearDto[];
  /** `null` while no year was ever created. */
  selectedYear: number | null;
  events: readonly EventListItemDto[];
  /** The "year about to start" panel; `null` when it could not be read. */
  pending: CalendarPendingDto | null;
  ministries: readonly CalendarMinistry[];
  /** Roles for the audience of internal events; `null` when the user cannot list them. */
  roles: readonly CalendarRoleOption[] | null;
  defaultLocale: string;
}

interface LoadCalendarOverviewInput {
  /** The raw `?year=` of the URL. */
  requestedYear: string | undefined;
  access: AccessSnapshot;
}

async function loadEvents(
  calendarApi: ServerCalendarApiClient,
  year: number | null,
): Promise<EventListItemDto[] | null> {
  if (year === null) return [];
  const response = await calendarApi.content.calendar.events.$get({
    query: { year: String(year) },
  });
  if (response.status === HTTP_FORBIDDEN) return null;
  if (!response.ok) throw new Error(`Could not load the events (${response.status})`);
  return (await response.json()).items;
}

async function loadPending(
  calendarApi: ServerCalendarApiClient,
): Promise<CalendarPendingDto | null> {
  const response = await calendarApi.content.calendar.pending.$get();
  return response.ok ? await response.json() : null;
}

/** Ministries only color and name the rows; a role that cannot list them still sees the events. */
async function loadMinistries(api: ServerApiClient): Promise<CalendarMinistry[]> {
  const response = await api.content.ministries.$get();
  if (!response.ok) return [];
  const { items } = await response.json();
  return items.map(({ id, name, title, color }) => ({ id, name: title ?? name, color }));
}

async function loadRoles(
  api: ServerApiClient,
  access: AccessSnapshot,
): Promise<CalendarRoleOption[] | null> {
  if (!can(access, PERMISSIONS.roles.view)) return null;
  const response = await api.roles.$get();
  if (!response.ok) return null;
  return (await response.json()).map(({ id, name }) => ({ id, name }));
}

/**
 * Everything `/calendar` shows. `null` when the role may not read the calendar (the page answers
 * 404 like the proxy does).
 */
export async function loadCalendarOverview({
  requestedYear,
  access,
}: LoadCalendarOverviewInput): Promise<CalendarOverview | null> {
  // Awaited one by one: inside `Promise.all` the client types blow TypeScript's depth limit.
  const api = await createServerApiClient();
  const calendarApi = await createServerCalendarApiClient();
  const [yearsResponse, pending, ministries, roles, site] = await Promise.all([
    calendarApi.content.calendar.years.$get(),
    loadPending(calendarApi),
    loadMinistries(api),
    loadRoles(api, access),
    loadSiteLocales(api),
  ]);
  if (yearsResponse.status === HTTP_FORBIDDEN) return null;
  if (!yearsResponse.ok) throw new Error(`Could not load the years (${yearsResponse.status})`);

  const { items: years } = await yearsResponse.json();
  const selectedYear = resolveSelectedYear({
    requested: requestedYear,
    years: years.map(({ year }) => year),
    currentYear: new Date().getFullYear(),
  });
  const events = await loadEvents(calendarApi, selectedYear);
  if (events === null) return null;
  return {
    years,
    selectedYear,
    events,
    pending,
    ministries,
    roles,
    defaultLocale: site.defaultLocale,
  };
}
