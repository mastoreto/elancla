import { type CalendarReminderSettingsDto, PERMISSIONS } from "@ancla/contracts";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { createServerCalendarApiClient } from "@/lib/api/createServerCalendarApiClient";
import { type AccessSnapshot, can } from "@/lib/authz/can";
import type { RecipientOption } from "../../types";

const HTTP_FORBIDDEN = 403;
const USERS_LIMIT = "100";

export interface ReminderSources {
  settings: CalendarReminderSettingsDto;
  /** `null` when the user cannot list roles. */
  roles: readonly RecipientOption[] | null;
  /** `null` when the user cannot list users. */
  users: readonly RecipientOption[] | null;
}

async function loadRoles(
  api: ServerApiClient,
  access: AccessSnapshot,
): Promise<RecipientOption[] | null> {
  if (!can(access, PERMISSIONS.roles.view)) return null;
  const response = await api.roles.$get();
  if (!response.ok) return null;
  return (await response.json()).map(({ id, name }) => ({ id, name }));
}

async function loadUsers(
  api: ServerApiClient,
  access: AccessSnapshot,
): Promise<RecipientOption[] | null> {
  if (!can(access, PERMISSIONS.users.view)) return null;
  const response = await api.users.$get({ query: { limit: USERS_LIMIT } });
  if (!response.ok) return null;
  const { items } = await response.json();
  return items.map(({ id, name, email }) => ({ id, name, hint: email }));
}

/** The saved recipients plus the roles and users that can be picked. `null`: no access (404). */
export async function loadReminderSources(access: AccessSnapshot): Promise<ReminderSources | null> {
  // Awaited one by one: inside `Promise.all` the client types blow TypeScript's depth limit.
  const api = await createServerApiClient();
  const calendarApi = await createServerCalendarApiClient();
  const [response, roles, users] = await Promise.all([
    calendarApi.content.calendar.reminders.$get(),
    loadRoles(api, access),
    loadUsers(api, access),
  ]);
  if (response.status === HTTP_FORBIDDEN) return null;
  if (!response.ok) throw new Error(`Could not load the reminders (${response.status})`);
  return { settings: await response.json(), roles, users };
}
