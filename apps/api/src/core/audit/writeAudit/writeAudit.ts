import type { AuditAction, AuditOutcome } from "@ancla/contracts";
import type { Prisma, PrismaClient } from "@ancla/db";
import type { AuditSource } from "../auditSource";
import { redact } from "../redact";

export interface AuditEvent {
  action: AuditAction;
  entity?: { type: string; id: string };
  /** State before the change, as the DTO the API exposes (no secrets). */
  before?: unknown;
  after?: unknown;
  /** Why (RF-05), when the use case asks for it. */
  reason?: string;
  outcome?: AuditOutcome;
  metadata?: Record<string, unknown>;
}

/** Either the transaction of the mutation being audited, or the plain client for lone events. */
export type AuditClient = Prisma.TransactionClient | PrismaClient;

/**
 * Appends one row to the audit trail. For a mutation pass its `tx`: the record then commits or
 * rolls back together with the change it describes.
 */
export async function writeAudit(
  client: AuditClient,
  source: AuditSource,
  event: AuditEvent,
): Promise<void> {
  await client.auditLog.create({
    data: {
      organizationId: source.organizationId,
      actorId: source.actor?.id ?? null,
      actorLabel: source.actor?.label ?? null,
      action: event.action,
      entityType: event.entity?.type,
      entityId: event.entity?.id,
      before: event.before === undefined ? undefined : redact(event.before),
      after: event.after === undefined ? undefined : redact(event.after),
      reason: event.reason,
      outcome: event.outcome ?? "success",
      ip: source.ip,
      userAgent: source.userAgent,
      requestId: source.requestId,
      metadata:
        event.metadata === undefined ? undefined : redact(event.metadata),
    },
  });
}
