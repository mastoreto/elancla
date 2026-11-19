import type { MePermissionsDto } from "@ancla/contracts";
import { canAny } from "@/lib/authz/can";
import { matchRouteRule } from "@/lib/authz/matchRouteRule";
import { isPublicPath } from "../isPublicPath";
import type { AccessLoader } from "../types";

export type AuthorizationDecision =
  | { type: "allow"; access?: MePermissionsDto }
  | { type: "login" }
  | { type: "notFound" };

interface AuthorizationInput {
  /** The internal pathname the request will render (after any church-slug rewrite). */
  pathname: string;
  cookie: string | null;
}

/**
 * Whether the signed-in user may open the page. Fails closed: a route with no rule is a 404, as is
 * one the roles do not allow (the section does not reveal itself). One access lookup per request.
 */
export async function decideAuthorization(
  { pathname, cookie }: AuthorizationInput,
  loadAccess: AccessLoader,
): Promise<AuthorizationDecision> {
  if (isPublicPath(pathname)) return { type: "allow" };

  const rule = matchRouteRule(pathname);
  if (!rule) return { type: "notFound" };

  const access = await loadAccess(cookie);
  if (!access) return { type: "login" };
  if (rule.adminOnly && !access.isAdmin) return { type: "notFound" };
  return canAny(access, rule.requires) ? { type: "allow", access } : { type: "notFound" };
}
