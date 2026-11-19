import type { MePermissionsDto, Permission } from "@ancla/contracts";
import { notFound } from "next/navigation";
import type { ChurchRouteSegment } from "@/lib/church";
import { canAny } from "../can";
import { getAccess } from "../getAccess";
import { ROUTE_PERMISSIONS } from "../routePermissions";

/**
 * Server guard for a page or layout: answers `notFound()` (not "forbidden", so the section does
 * not reveal itself) unless the user holds any of the permissions. Returns the access it checked.
 */
export async function requirePermissions(
  permissions: readonly Permission[],
): Promise<MePermissionsDto> {
  const access = await getAccess();
  if (!(access && canAny(access, permissions))) notFound();
  return access;
}

/** The single guard for a dashboard section: its permissions come from `ROUTE_PERMISSIONS`. */
export function requireRoutePermission(route: ChurchRouteSegment): Promise<MePermissionsDto> {
  return requirePermissions(ROUTE_PERMISSIONS[route]);
}
