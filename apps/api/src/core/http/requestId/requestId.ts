import { requestId as honoRequestId } from "hono/request-id";

export const REQUEST_ID_HEADER = "X-Request-Id";

export const requestId = honoRequestId({ headerName: REQUEST_ID_HEADER });

/**
 * A copy of the headers carrying the request id the API generated (the incoming one is
 * client-controlled), for code that only receives raw headers: Better Auth and its hooks.
 */
export function withRequestId(headers: Headers, requestId: string): Headers {
  const copy = new Headers(headers);
  copy.set(REQUEST_ID_HEADER, requestId);
  return copy;
}
