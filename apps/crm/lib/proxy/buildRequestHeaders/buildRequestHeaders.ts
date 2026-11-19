import { ACCESS_HEADER } from "@/lib/authz/accessHeader";
import { CSP_HEADER, NONCE_HEADER } from "../constants";

interface RequestHeadersInput {
  incoming: Headers;
  nonce: string;
  contentSecurityPolicy: string;
}

/**
 * Headers the page receives. Next reads the nonce from the request's CSP header and stamps it on
 * its own scripts. Any client-sent access header is dropped: only the proxy may vouch for access.
 */
export function buildRequestHeaders({
  incoming,
  nonce,
  contentSecurityPolicy,
}: RequestHeadersInput): Headers {
  const headers = new Headers(incoming);
  headers.delete(ACCESS_HEADER);
  headers.set(NONCE_HEADER, nonce);
  headers.set(CSP_HEADER, contentSecurityPolicy);
  return headers;
}
