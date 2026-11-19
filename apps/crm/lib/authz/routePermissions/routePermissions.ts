import type { Permission } from "@ancla/contracts";
import type { ChurchRouteSegment } from "@/lib/church";

/** Any one of these opens Configuración (each tab then checks its own permission). */
export const SETTINGS_PERMISSIONS = [
  "settings:view",
  "users:view",
  "roles:view",
  "invitations:view",
] as const satisfies readonly Permission[];

/**
 * What a signed-in user needs to see each section: any one of the listed permissions; an empty
 * list means every signed-in user. The sidebar and the route guards read this same table.
 */
export const ROUTE_PERMISSIONS = {
  resume: [],
  movements: ["movements:view"],
  requests: ["requests:view"],
  receipts: ["vouchers:view"],
  vouchers: ["vouchers:view"],
  projects: ["projects:view"],
  budgets: ["budgets:view"],
  // ponytail: inventory has no permission resource of its own yet; it follows movements.
  inventory: ["movements:view"],
  voting: ["voting:view"],
  assembly: ["voting:view"],
  reports: ["reports:view"],
  website: ["content:view"],
  blog: ["content:view"],
  podcasts: ["content:view"],
  sermons: ["content:view"],
  ministries: ["ministries.profile:view"],
  settings: SETTINGS_PERMISSIONS,
} as const satisfies Record<ChurchRouteSegment, readonly Permission[]>;
