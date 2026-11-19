import {
  buildChurchRoutePath,
  type ChurchRouteSegment,
  churchConfig,
  churchToDashboardRouteMap,
  type DashboardRouteSegment,
  dashboardToChurchRouteMap,
  defaultChurchRouteSegment,
} from "@/lib/church";

export type ChurchResolution =
  | { type: "pass" }
  | { type: "redirect"; pathname: string }
  | { type: "rewrite"; pathname: string };

interface ChurchRouteInput {
  segments: string[];
  isInternalRewrite: boolean;
}

function resolveChurchUrl(segments: string[]): ChurchResolution {
  if (segments.length === 1) {
    return {
      type: "redirect",
      pathname: buildChurchRoutePath(churchConfig.slug, defaultChurchRouteSegment),
    };
  }
  const internalRoute = churchToDashboardRouteMap[segments[1] as ChurchRouteSegment];
  if (!internalRoute) return { type: "pass" };
  return { type: "rewrite", pathname: `/${[internalRoute, ...segments.slice(2)].join("/")}` };
}

/**
 * Maps the public church URLs (`/el-ancla/movements`) to the internal routes and back: the church
 * URL is rewritten to the internal page, and an internal URL typed directly is redirected to the
 * church one (unless the proxy itself rewrote it).
 */
export function resolveChurchRoute({
  segments,
  isInternalRewrite,
}: ChurchRouteInput): ChurchResolution {
  const [first] = segments;
  if (first === undefined) return { type: "pass" };
  if (first === churchConfig.slug) return resolveChurchUrl(segments);

  const churchRoute = dashboardToChurchRouteMap[first as DashboardRouteSegment];
  if (!churchRoute || isInternalRewrite) return { type: "pass" };
  return {
    type: "redirect",
    pathname: buildChurchRoutePath(churchConfig.slug, churchRoute, ...segments.slice(1)),
  };
}
