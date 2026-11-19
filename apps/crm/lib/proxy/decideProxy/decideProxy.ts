import { LOGIN_PATH } from "../constants";
import { decideAuthorization } from "../decideAuthorization";
import { decideSessionGate } from "../decideSessionGate";
import { splitSegments } from "../isPublicPath";
import { resolveChurchRoute } from "../resolveChurchRoute";
import type { AccessLoader, ProxyDecision, ProxyRequestFacts } from "../types";

const LOGIN_REDIRECT: ProxyDecision = { type: "redirect", pathname: LOGIN_PATH, keepSearch: false };

/** The pipeline after the security headers: session gate, church route resolution, authorization. */
export async function decideProxy(
  facts: ProxyRequestFacts,
  loadAccess: AccessLoader,
): Promise<ProxyDecision> {
  const { pathname, cookie } = facts;
  if (decideSessionGate(facts) === "login") return LOGIN_REDIRECT;

  const resolution = resolveChurchRoute({
    segments: splitSegments(pathname),
    isInternalRewrite: facts.isInternalRewrite,
  });
  if (resolution.type === "redirect") {
    return { type: "redirect", pathname: resolution.pathname, keepSearch: true };
  }

  const target = resolution.type === "rewrite" ? resolution.pathname : pathname;
  const authorization = await decideAuthorization({ pathname: target, cookie }, loadAccess);
  if (authorization.type === "login") return LOGIN_REDIRECT;
  if (authorization.type === "notFound") return { type: "notFound" };

  return resolution.type === "rewrite"
    ? { type: "rewrite", pathname: resolution.pathname, access: authorization.access }
    : { type: "next", access: authorization.access };
}
