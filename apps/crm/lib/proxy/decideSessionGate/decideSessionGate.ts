import { isPublicPath } from "../isPublicPath";

interface SessionGateInput {
  pathname: string;
  hasSessionCookie: boolean;
  isDevBypass: boolean;
}

export type SessionGateDecision = "allow" | "login";

/**
 * Optimistic check: without a session cookie only public pages open. The real validation (against
 * the database) happens when the access is loaded; the matcher already excludes `/api` and assets.
 */
export function decideSessionGate({
  pathname,
  hasSessionCookie,
  isDevBypass,
}: SessionGateInput): SessionGateDecision {
  if (isPublicPath(pathname) || isDevBypass || hasSessionCookie) return "allow";
  return "login";
}
