import { app } from "@ancla/api";
import { headers } from "next/headers";
import { createInProcessApiClient, type ServerApiClient } from "../createInProcessApiClient";

/**
 * API client for Server Components and Server Actions: calls the Hono app in process with the
 * current request's cookie. Never import it from a Client Component (it pulls the API and Prisma).
 * ponytail: `server-only` is not installed; the import rule above is enforced by review.
 */
export async function createServerApiClient(): Promise<ServerApiClient> {
  const requestHeaders = await headers();
  return createInProcessApiClient({
    dispatch: (request) => app.request(request),
    cookie: requestHeaders.get("cookie"),
    userAgent: requestHeaders.get("user-agent"),
    forwardedFor: requestHeaders.get("x-forwarded-for"),
  });
}
