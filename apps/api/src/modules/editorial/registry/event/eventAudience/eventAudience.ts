import { ADMIN_ROLE_KEY, PERMISSIONS } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import type { Access } from "../../../../../core/context";
import { canSeeEvent } from "../canSeeEvent";

const INTERNAL_VIEW = PERMISSIONS.calendarInternal.view.split(":") as [
  string,
  string,
];

/**
 * Of these events, the ids this access may see, in one query: the inbox of the review lists
 * revisions of many events at once. An id with no row is left in (nothing to hide).
 */
export async function eventsVisibleTo(
  tx: Prisma.TransactionClient,
  organizationId: string,
  entityIds: readonly string[],
  access: Access,
): Promise<Set<string>> {
  const rows = await tx.event.findMany({
    where: { organizationId, id: { in: [...entityIds] } },
    select: {
      id: true,
      visibility: true,
      audienceRoles: { select: { roleId: true } },
    },
  });
  const hidden = new Set(
    rows
      .filter(
        (row) =>
          !canSeeEvent(access, {
            visibility: row.visibility,
            audienceRoleIds: row.audienceRoles.map(({ roleId }) => roleId),
          }),
      )
      .map(({ id }) => id),
  );
  return new Set(entityIds.filter((id) => !hidden.has(id)));
}

/**
 * Of these users, the ones who may see the event: the same rule as `canSeeEvent`, worked out from
 * their roles because an email has no request access (admin always; otherwise the
 * `calendar.internal:view` permission from any role and one role of the audience).
 */
export async function eventUsersWhoCanSee(
  tx: Prisma.TransactionClient,
  organizationId: string,
  entityId: string,
  userIds: readonly string[],
): Promise<Set<string>> {
  const event = await tx.event.findFirst({
    where: { id: entityId, organizationId },
    select: { visibility: true, audienceRoles: { select: { roleId: true } } },
  });
  if (!event || event.visibility === "PUBLIC") return new Set(userIds);
  const audience = new Set(event.audienceRoles.map(({ roleId }) => roleId));
  const memberships = await tx.userRole.findMany({
    where: { userId: { in: [...userIds] }, role: { organizationId } },
    select: {
      userId: true,
      role: {
        select: {
          id: true,
          key: true,
          permissions: {
            where: { resource: INTERNAL_VIEW[0], action: INTERNAL_VIEW[1] },
            select: { roleId: true },
          },
        },
      },
    },
  });
  const byUser = new Map<string, typeof memberships>();
  for (const membership of memberships) {
    byUser.set(membership.userId, [
      ...(byUser.get(membership.userId) ?? []),
      membership,
    ]);
  }
  return new Set(
    userIds.filter((userId) => {
      const roles = (byUser.get(userId) ?? []).map(({ role }) => role);
      if (roles.some((role) => role.key === ADMIN_ROLE_KEY)) return true;
      return (
        roles.some((role) => role.permissions.length > 0) &&
        roles.some((role) => audience.has(role.id))
      );
    }),
  );
}
