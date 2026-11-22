import type { AppType } from "@ancla/api";
import { hc } from "hono/client";

/** Placeholder origin: requests never leave the process, but `hc` needs an absolute URL. */
const IN_PROCESS_BASE_URL = "http://localhost/api";

export interface InProcessApiClientOptions {
  /** `app.request`-like entry point of the API (injected so this stays testable). */
  dispatch: (request: Request) => Response | Promise<Response>;
  /** Raw `Cookie` header of the incoming CRM request, forwarded as-is. */
  cookie: string | null;
  /** The browser's address and agent, so the API's audit trail records who really asked. */
  userAgent?: string | null;
  forwardedFor?: string | null;
}

/** The `fetch` of an in-process client: dispatches to the API forwarding the caller's identity. */
export function inProcessFetch({
  dispatch,
  cookie,
  userAgent,
  forwardedFor,
}: InProcessApiClientOptions): (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Response | Promise<Response> {
  return (input, init) => {
    const request = new Request(input, init);
    if (cookie) request.headers.set("cookie", cookie);
    if (userAgent) request.headers.set("user-agent", userAgent);
    if (forwardedFor) request.headers.set("x-forwarded-for", forwardedFor);
    return dispatch(request);
  };
}

/** Typed client that calls the API in the same process, forwarding the caller's cookie. */
export function createInProcessApiClient(options: InProcessApiClientOptions) {
  return hc<AppType>(IN_PROCESS_BASE_URL, { fetch: inProcessFetch(options) });
}

export type ServerApiClient = ReturnType<typeof createInProcessApiClient>;
