import type { Permission } from "@ancla/contracts";
import { churchToDashboardRouteMap } from "@/lib/church";
import { ROUTE_PERMISSIONS } from "../routePermissions";

export interface RouteRule {
  /** Internal pathname prefix; a `*` segment matches any one segment (`/settings/roles/*\/edit`). */
  path: string;
  /** Any one of these opens the route; an empty list means every signed-in user. */
  requires: readonly Permission[];
  /** Admin-only on top of the permissions (role management). */
  adminOnly?: boolean;
}

const SECTION_RULES: RouteRule[] = Object.entries(ROUTE_PERMISSIONS)
  // Settings has finer rules below: its page serves "Mi cuenta" to everyone.
  .filter(([route]) => route !== "settings")
  .map(([route, requires]) => ({
    path: `/${churchToDashboardRouteMap[route as keyof typeof churchToDashboardRouteMap]}`,
    requires,
  }));

/**
 * Every dashboard route and who may open it, by internal pathname. A route that matches no rule is
 * denied (fail closed), so a new section must be added here. The sidebar reads `ROUTE_PERMISSIONS`.
 */
export const ROUTE_RULES: readonly RouteRule[] = [
  ...SECTION_RULES,
  { path: "/settings", requires: [] },
  { path: "/settings/emails", requires: ["settings:view"] },
  { path: "/settings/roles/new", requires: ["roles:create"], adminOnly: true },
  { path: "/settings/roles/*/edit", requires: ["roles:view"], adminOnly: true },
];
