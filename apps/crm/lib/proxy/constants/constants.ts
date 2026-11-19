export const LOGIN_PATH = "/";
/** Rewriting here renders the app's not-found page with a 404 status, without a redirect. */
export const NOT_FOUND_PATH = "/__not-found";
export const NONCE_HEADER = "x-nonce";
export const CSP_HEADER = "Content-Security-Policy";
/** Set on the rewritten request so the internal URL is not redirected back to the church URL. */
export const INTERNAL_REWRITE_HEADER = "x-iekklesia-internal-rewrite";
export const INTERNAL_REWRITE_VALUE = "1";

/**
 * Pages reachable without a session: attendee-facing assembly reports and the account flows
 * (accept an invitation, finish a two-factor login, recover a password).
 */
export const PUBLIC_ROUTE_SEGMENTS: readonly string[] = [
  "informe",
  "invitation",
  "two-factor",
  "reset-password",
];
