import type { Prisma } from "@ancla/db";
import type { Access } from "../../../../../core/context";
import { canSeeEvent } from "../canSeeEvent";

/**
 * The `entityVisibleTo` hook of the event type: an internal event is a 404 for whoever is not in
 * its audience, so the editorial routes never leak it. An id that matches nothing is left to
 * `entityExists`.
 */
export async function eventVisibleTo(
  tx: Prisma.TransactionClient,
  organizationId: string,
  entityId: string,
  access: Access,
): Promise<boolean> {
  const event = await tx.event.findFirst({
    where: { id: entityId, organizationId },
    select: { visibility: true, audienceRoles: { select: { roleId: true } } },
  });
  if (!event) return true;
  return canSeeEvent(access, {
    visibility: event.visibility,
    audienceRoleIds: event.audienceRoles.map(({ roleId }) => roleId),
  });
}
