import type { Permission } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import type { ChurchRouteSegment } from "@/lib/church";

/** Any one of these opens Configuración (each tab then checks its own permission). */
export const SETTINGS_PERMISSIONS = [
  PERMISSIONS.settings.view,
  PERMISSIONS.users.view,
  PERMISSIONS.roles.view,
  PERMISSIONS.invitations.view,
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
  website: [PERMISSIONS.content.view],
  blog: [PERMISSIONS.content.view],
  podcasts: [PERMISSIONS.content.view],
  sermons: [PERMISSIONS.content.view],
  ministries: [PERMISSIONS.ministryProfile.view],
  settings: SETTINGS_PERMISSIONS,
} as const satisfies Record<ChurchRouteSegment, readonly Permission[]>;
