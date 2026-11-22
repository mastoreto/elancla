import type { Prisma } from "@ancla/db";
import { findExistingRoleIdsOf } from "../../data";
import { InvalidCalendarReferenceError } from "../../domain";

/** Every role of an event audience has to be a role of the organization. */
export async function assertAudienceRoles(
  tx: Prisma.TransactionClient,
  organizationId: string,
  roleIds: readonly string[],
): Promise<void> {
  const unique = [...new Set(roleIds)];
  const found = await findExistingRoleIdsOf(tx, organizationId, unique);
  if (found.length !== unique.length) {
    throw new InvalidCalendarReferenceError(
      "invalid_role",
      "Some roles of the audience do not exist",
    );
  }
}
