import { app } from "../../src/app";
import { getApiEnv } from "../../src/core/env";
import type { createFixtures } from "./fixtures";

export const TEST_USER_AGENT = "ancla-api-test";

export interface ApiCallOptions {
  cookie?: string;
  body?: unknown;
  /** Extra request headers, e.g. `Authorization` for the public API. */
  headers?: Record<string, string>;
}

/**
 * Calls the API in-process as the CRM's browser would (JSON, same-origin). Every call gets its own
 * client address so rate limits never leak between tests.
 */
export function createApiCaller(fixtures: ReturnType<typeof createFixtures>) {
  const { CRM_ORIGIN } = getApiEnv();
  return (
    method: string,
    path: string,
    options: ApiCallOptions = {},
  ): Promise<Response> =>
    Promise.resolve(
      app.request(`/api${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Origin: CRM_ORIGIN,
          ...(options.cookie ? { Cookie: options.cookie } : {}),
          "X-Forwarded-For": fixtures.uniqueIp(),
          "User-Agent": TEST_USER_AGENT,
          ...options.headers,
        },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
      }),
    );
}
