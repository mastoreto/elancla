import type { AppType } from "@ancla/api";
import { hc } from "hono/client";

/** Placeholder origin: requests never leave the process, but `hc` needs an absolute URL. */
const IN_PROCESS_BASE_URL = "http://localhost/api";

export interface InProcessApiClientOptions {
  /** `app.request`-like entry point of the API (injected so this stays testable). */
  dispatch: (request: Request) => Response | Promise<Response>;
  /** Raw `Cookie` header of the incoming CRM request, forwarded as-is. */
  cookie: string | null;
}

/** Typed client that calls the API in the same process, forwarding the caller's cookie. */
export function createInProcessApiClient({ dispatch, cookie }: InProcessApiClientOptions) {
  return hc<AppType>(IN_PROCESS_BASE_URL, {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      if (cookie) request.headers.set("cookie", cookie);
      return dispatch(request);
    },
  });
}

export type ServerApiClient = ReturnType<typeof createInProcessApiClient>;
