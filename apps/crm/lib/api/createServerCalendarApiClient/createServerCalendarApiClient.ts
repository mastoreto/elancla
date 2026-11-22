import { app, type CalendarAppType } from "@ancla/api";
import { hc } from "hono/client";
import { headers } from "next/headers";
import { inProcessFetch } from "../createInProcessApiClient";

/** Placeholder origin: requests never leave the process, but `hc` needs an absolute URL. */
const IN_PROCESS_BASE_URL = "http://localhost/api";

export type ServerCalendarApiClient = ReturnType<typeof hc<CalendarAppType>>;

/**
 * Calendar client for Server Components: calls the Hono app in process with the current request's
 * cookie. Never import it from a Client Component (it pulls the API and Prisma).
 */
export async function createServerCalendarApiClient(): Promise<ServerCalendarApiClient> {
  const requestHeaders = await headers();
  return hc<CalendarAppType>(IN_PROCESS_BASE_URL, {
    fetch: inProcessFetch({
      dispatch: (request) => app.request(request),
      cookie: requestHeaders.get("cookie"),
      userAgent: requestHeaders.get("user-agent"),
      forwardedFor: requestHeaders.get("x-forwarded-for"),
    }),
  });
}
