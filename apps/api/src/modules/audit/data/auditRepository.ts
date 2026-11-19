import type { AuditListQuery } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

type AuditFilters = Omit<AuditListQuery, "cursor" | "limit">;

function toWhere(filters: AuditFilters): Prisma.AuditLogWhereInput {
  const { from, to, action, entityType, entityId, outcome, actor } = filters;
  return {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
    ...(outcome ? { outcome } : {}),
    ...(actor ? { actorLabel: { contains: actor, mode: "insensitive" } } : {}),
  };
}

/** Newest first. UUIDv7 ids sort by time, so the id doubles as the cursor. */
export function listAuditRows(organizationId: string, query: AuditListQuery) {
  const { cursor, limit, ...filters } = query;
  return forOrganization(db, organizationId).auditLog.findMany({
    where: toWhere(filters),
    orderBy: { id: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}
