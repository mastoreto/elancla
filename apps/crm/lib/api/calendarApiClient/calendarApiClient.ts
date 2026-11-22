import type { CalendarAppType } from "@ancla/api";
import { hc } from "hono/client";

/**
 * Typed client of the calendar routes, for the browser (same origin, the session cookie travels by
 * itself). They live on their own router: chained into `AppType` they push the client type over
 * TypeScript's instantiation depth limit. Events are the exception to "calendar routes": their
 * content (title, dates, place) goes through `apiClient.editorial`, like any editorial type.
 */
export const calendarApiClient = hc<CalendarAppType>("/api");
