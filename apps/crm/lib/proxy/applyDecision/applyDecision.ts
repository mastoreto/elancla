import type { MePermissionsDto } from "@ancla/contracts";
import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_HEADER, serializeAccess } from "@/lib/authz/accessHeader";
import { INTERNAL_REWRITE_HEADER, INTERNAL_REWRITE_VALUE, NOT_FOUND_PATH } from "../constants";
import type { ProxyDecision } from "../types";

const NOT_FOUND_STATUS = 404;

function withPathname(request: NextRequest, pathname: string, keepSearch = true): URL {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (!keepSearch) url.search = "";
  return url;
}

function headersWithAccess(base: Headers, access: MePermissionsDto | undefined): Headers {
  const headers = new Headers(base);
  if (access) headers.set(ACCESS_HEADER, serializeAccess(access));
  return headers;
}

/** The only place that turns a decision into a `NextResponse`. */
export function applyDecision(
  decision: ProxyDecision,
  request: NextRequest,
  requestHeaders: Headers,
): NextResponse {
  switch (decision.type) {
    case "redirect":
      return NextResponse.redirect(withPathname(request, decision.pathname, decision.keepSearch));
    case "notFound":
      return NextResponse.rewrite(withPathname(request, NOT_FOUND_PATH), {
        status: NOT_FOUND_STATUS,
        request: { headers: requestHeaders },
      });
    case "rewrite": {
      const headers = headersWithAccess(requestHeaders, decision.access);
      headers.set(INTERNAL_REWRITE_HEADER, INTERNAL_REWRITE_VALUE);
      return NextResponse.rewrite(withPathname(request, decision.pathname), {
        request: { headers },
      });
    }
    case "next":
      return NextResponse.next({
        request: { headers: headersWithAccess(requestHeaders, decision.access) },
      });
  }
}
