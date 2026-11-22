import type { Permission } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import { churchToDashboardRouteMap } from "@/lib/church";
import {
  CALENDAR_EDIT_ROUTE_PERMISSIONS,
  MINISTRY_CONFIG_ROUTE_PERMISSIONS,
  PAGES_ROUTE_PERMISSIONS,
  PEOPLE_ROUTE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  VISIT_ROUTE_PERMISSIONS,
} from "../routePermissions";

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
  // The longest prefix wins, so people profiles, pages and the visit page do not fall back to `site:view`.
  { path: "/website/people", requires: PEOPLE_ROUTE_PERMISSIONS },
  { path: "/website/pages", requires: PAGES_ROUTE_PERMISSIONS },
  { path: "/website/visit", requires: VISIT_ROUTE_PERMISSIONS },
  // The ministry settings need the edit permission (and the all scope, which the pages check).
  { path: "/ministries/landing", requires: MINISTRY_CONFIG_ROUTE_PERMISSIONS },
  { path: "/ministries/categories", requires: MINISTRY_CONFIG_ROUTE_PERMISSIONS },
  // The copy wizard and the reminder recipients need the edit permission (the API checks it too).
  { path: "/calendar/copy", requires: CALENDAR_EDIT_ROUTE_PERMISSIONS },
  { path: "/calendar/reminders", requires: CALENDAR_EDIT_ROUTE_PERMISSIONS },
  { path: "/settings", requires: [] },
  { path: "/settings/emails", requires: [PERMISSIONS.settings.view] },
  { path: "/settings/audit", requires: [PERMISSIONS.audit.view] },
  { path: "/settings/roles/new", requires: [PERMISSIONS.roles.create], adminOnly: true },
  { path: "/settings/roles/*/edit", requires: [PERMISSIONS.roles.view], adminOnly: true },
];
