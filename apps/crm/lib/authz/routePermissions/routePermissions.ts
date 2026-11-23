import type { Permission } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import type { ChurchRouteSegment } from "@/lib/church";

/** Any one of these opens Configuración (each tab then checks its own permission). */
export const SETTINGS_PERMISSIONS = [
  PERMISSIONS.settings.view,
  PERMISSIONS.users.view,
  PERMISSIONS.roles.view,
  PERMISSIONS.invitations.view,
  PERMISSIONS.audit.view,
] as const satisfies readonly Permission[];

/** Team profiles live under /website but have their own permission resource. */
export const PEOPLE_ROUTE_PERMISSIONS = [
  PERMISSIONS.people.view,
] as const satisfies readonly Permission[];

/** Simple pages live under /website but have their own permission resource. */
export const PAGES_ROUTE_PERMISSIONS = [
  PERMISSIONS.pages.view,
] as const satisfies readonly Permission[];

/** The visit page lives under /website but has its own permission resource. */
export const VISIT_ROUTE_PERMISSIONS = [
  PERMISSIONS.visit.view,
] as const satisfies readonly Permission[];

/** The landing mosaic and the categories live under /ministries but need the edit permission. */
export const MINISTRY_CONFIG_ROUTE_PERMISSIONS = [
  PERMISSIONS.ministryProfile.edit,
] as const satisfies readonly Permission[];

/** The copy wizard and the reminder recipients live under /calendar but only make sense to editors. */
export const CALENDAR_EDIT_ROUTE_PERMISSIONS = [
  PERMISSIONS.events.edit,
] as const satisfies readonly Permission[];

/**
 * What a signed-in user needs to see each section: any one of the listed permissions; an empty
 * list means every signed-in user. The sidebar and the route guards read this same table.
 */
export const ROUTE_PERMISSIONS = {
  resume: [],
  movements: [PERMISSIONS.movements.view],
  requests: [PERMISSIONS.requests.view],
  receipts: [PERMISSIONS.vouchers.view],
  vouchers: [PERMISSIONS.vouchers.view],
  projects: [PERMISSIONS.projects.view],
  budgets: [PERMISSIONS.budgets.view],
  // ponytail: inventory has no permission resource of its own yet; it follows movements.
  inventory: [PERMISSIONS.movements.view],
  voting: [PERMISSIONS.voting.view],
  assembly: [PERMISSIONS.voting.view],
  reports: [PERMISSIONS.reports.view],
  website: [PERMISSIONS.site.view],
  blog: [PERMISSIONS.blogPosts.view],
  podcasts: [PERMISSIONS.podcasts.view],
  sermons: [PERMISSIONS.sermons.view],
  ministries: [PERMISSIONS.ministryProfile.view],
  calendar: [PERMISSIONS.events.view],
  settings: SETTINGS_PERMISSIONS,
} as const satisfies Record<ChurchRouteSegment, readonly Permission[]>;
