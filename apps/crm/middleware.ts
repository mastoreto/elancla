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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const isInternalRewrite = request.headers.get("x-iekklesia-internal-rewrite") === "1";

  // Guard optimista de auth: sin cookie de sesión solo se permite el login ("/").
  // La validación real (contra BD) la hace el layout del dashboard. El matcher ya
  // excluye /api/auth/* y assets, así que aquí solo llegan rutas de página.
  if (pathname !== "/" && !getSessionCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (segments.length === 0) {
    return NextResponse.next();
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
      return NextResponse.next();
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${[internalRoute, ...segments.slice(2)].join("/")}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-iekklesia-internal-rewrite", "1");

    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  const internalRoute = segments[0] as DashboardRouteSegment;
  const churchRoute = dashboardToChurchRouteMap[internalRoute];

  if (!churchRoute) {
    return NextResponse.next();
  }

  if (isInternalRewrite) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = buildChurchRoutePath(churchConfig.slug, churchRoute, ...segments.slice(1));

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
