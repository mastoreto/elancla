import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest, NextResponse } from "next/server";
import { buildSecurityHeaders, type MediaOrigins } from "@/lib/security";
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
  /** Origins of the storage and the media CDN for the CSP; none when storage is not configured. */
  mediaOrigins?: () => MediaOrigins;
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
      ...dependencies.mediaOrigins?.(),
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
