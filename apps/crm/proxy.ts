import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildChurchRoutePath,
  type ChurchRouteSegment,
  churchConfig,
  churchToDashboardRouteMap,
  type DashboardRouteSegment,
  dashboardToChurchRouteMap,
  defaultChurchRouteSegment,
} from "./lib/church";
import { isDevAuthBypassEnabled } from "./lib/dev-auth-bypass";
import { buildSecurityHeaders } from "./lib/security";

// Pages reachable without a session (attendee-facing assembly reports).
const PUBLIC_ROUTE_SEGMENTS: readonly string[] = ["informe"];

function routeRequest(request: NextRequest, requestHeaders: Headers): NextResponse {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const isInternalRewrite = request.headers.get("x-iekklesia-internal-rewrite") === "1";

  // Guard optimista de auth: sin cookie de sesión solo se permite el login ("/").
  // La validación real (contra BD) la hace el layout del dashboard. El matcher ya
  // excluye /api/auth/* y assets, así que aquí solo llegan rutas de página.
  const isPublicRoute = PUBLIC_ROUTE_SEGMENTS.includes(segments[0] ?? "");
  if (
    pathname !== "/" &&
    !isPublicRoute &&
    !isDevAuthBypassEnabled() &&
    !getSessionCookie(request)
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  const passThrough = (): NextResponse =>
    NextResponse.next({ request: { headers: requestHeaders } });

  if (segments.length === 0) {
    return passThrough();
  }

  if (segments[0] === churchConfig.slug) {
    if (segments.length === 1) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = buildChurchRoutePath(churchConfig.slug, defaultChurchRouteSegment);
      return NextResponse.redirect(redirectUrl);
    }

    const churchRoute = segments[1] as ChurchRouteSegment;
    const internalRoute = churchToDashboardRouteMap[churchRoute];

    if (!internalRoute) {
      return passThrough();
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${[internalRoute, ...segments.slice(2)].join("/")}`;
    const rewriteHeaders = new Headers(requestHeaders);
    rewriteHeaders.set("x-iekklesia-internal-rewrite", "1");

    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: rewriteHeaders,
      },
    });
  }

  const internalRoute = segments[0] as DashboardRouteSegment;
  const churchRoute = dashboardToChurchRouteMap[internalRoute];

  if (!churchRoute) {
    return passThrough();
  }

  if (isInternalRewrite) {
    return passThrough();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = buildChurchRoutePath(churchConfig.slug, churchRoute, ...segments.slice(1));

  return NextResponse.redirect(redirectUrl);
}

export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const securityHeaders = buildSecurityHeaders({
    nonce,
    pathname: request.nextUrl.pathname,
    isDevelopment: process.env.NODE_ENV === "development",
  });

  // Next reads the nonce from the request's CSP header and stamps it on its own scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    securityHeaders["Content-Security-Policy"] as string,
  );

  const response = routeRequest(request, requestHeaders);
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
