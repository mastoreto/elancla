import { db } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

export function listMinistryRows(
  organizationId: string,
  scope: Record<string, unknown>,
  page: { cursor?: string; limit: number },
) {
  return forOrganization(db, organizationId).ministry.findMany({
    where: scope,
    orderBy: { id: "desc" },
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
}
