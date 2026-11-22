import { PERMISSIONS } from "@ancla/contracts";
import { scopeOf } from "../../../../../core/authz";
import type { Access } from "../../../../../core/context";

interface EventAudience {
  visibility: "PUBLIC" | "INTERNAL";
  audienceRoleIds: readonly string[];
}

/**
 * Whether the user may see an event in the CRM. Public events are for everyone who can read the
 * calendar; an internal one only for the admin, or whoever holds `calendar.internal:view` and one
 * of the roles of its audience.
 */
export function canSeeEvent(access: Access, event: EventAudience): boolean {
  if (event.visibility === "PUBLIC" || access.isAdmin) return true;
  if (scopeOf(access, PERMISSIONS.calendarInternal.view) === null) return false;
  const audience = new Set(event.audienceRoleIds);
  return access.roles.some((role) => audience.has(role.id));
}
