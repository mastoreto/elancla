import type { AuditLogDto } from "@ancla/contracts";
import type { AuditLog } from "@ancla/db";

export function toAuditLogDto(row: AuditLog): AuditLogDto {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    actorId: row.actorId,
    actorLabel: row.actorLabel,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    before: row.before,
    after: row.after,
    reason: row.reason,
    outcome: row.outcome,
    ip: row.ip,
    userAgent: row.userAgent,
    requestId: row.requestId,
    metadata: row.metadata,
  };
}
