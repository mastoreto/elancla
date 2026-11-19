import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest, NextResponse } from "next/server";
import { buildSecurityHeaders } from "@/lib/security";
import { applyDecision } from "../applyDecision";
import { buildRequestHeaders } from "../buildRequestHeaders";
import { INTERNAL_REWRITE_HEADER, INTERNAL_REWRITE_VALUE } from "../constants";
import { decideProxy } from "../decideProxy";
import type { AccessLoader } from "../types";

export interface ProxyDependencies {
  loadAccess: AccessLoader;
  isDevBypass: () => boolean;
  isDevelopment: () => boolean;
  createNonce: () => string;
}

/** Builds the Next.js proxy: security headers, then the routing and authorization decision. */
export function createProxy(
  dependencies: ProxyDependencies,
): (request: NextRequest) => Promise<NextResponse> {
  return async function proxy(request: NextRequest): Promise<NextResponse> {
    const nonce = dependencies.createNonce();
    const securityHeaders = buildSecurityHeaders({
      nonce,
      pathname: request.nextUrl.pathname,
      isDevelopment: dependencies.isDevelopment(),
    });
    const requestHeaders = buildRequestHeaders({
      incoming: request.headers,
      nonce,
      contentSecurityPolicy: securityHeaders["Content-Security-Policy"] as string,
    });

    const decision = await decideProxy(
      {
        pathname: request.nextUrl.pathname,
        cookie: request.headers.get("cookie"),
        hasSessionCookie: Boolean(getSessionCookie(request)),
        isDevBypass: dependencies.isDevBypass(),
        isInternalRewrite: request.headers.get(INTERNAL_REWRITE_HEADER) === INTERNAL_REWRITE_VALUE,
      },
      dependencies.loadAccess,
    );

    const response = applyDecision(decision, request, requestHeaders);
    for (const [name, value] of Object.entries(securityHeaders)) {
      response.headers.set(name, value);
    }
    return response;
  };
}
