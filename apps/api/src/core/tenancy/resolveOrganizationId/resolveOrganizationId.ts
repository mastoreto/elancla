import { db } from "@ancla/db";
import { ForbiddenError } from "../../errors";

let cachedOrganizationId: string | undefined;

/**
 * ponytail: there is a single organization today, so the tenant is "the only one". Phase 0.4
 * resolves it from the user's membership and this function goes away.
 */
export async function resolveOrganizationId(): Promise<string> {
  if (cachedOrganizationId) return cachedOrganizationId;
  const organization = await db.organization.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!organization) throw new ForbiddenError("No organization is configured");
  cachedOrganizationId = organization.id;
  return cachedOrganizationId;
}
