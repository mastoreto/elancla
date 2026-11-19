import { z } from "zod";
import { pageQuerySchema } from "../common";
import { AUDIT_OUTCOMES } from "./auditActions";

export const MAX_AUDIT_FILTER_LENGTH = 200;

export const auditLogDto = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  actorId: z.uuid().nullable(),
  /** Email (or "cli") at the time of the event; the user may no longer exist. */
  actorLabel: z.string().nullable(),
  action: z.string(),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  reason: z.string().nullable(),
  outcome: z.enum(AUDIT_OUTCOMES),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  requestId: z.string().nullable(),
  metadata: z.unknown().nullable(),
});

const filterText = z.string().trim().min(1).max(MAX_AUDIT_FILTER_LENGTH);

export const auditListQuery = pageQuerySchema.extend({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  action: filterText.optional(),
  entityType: filterText.optional(),
  entityId: filterText.optional(),
  outcome: z.enum(AUDIT_OUTCOMES).optional(),
  /** Matches `actorLabel` (the auditor has no permission to list users). */
  actor: filterText.optional(),
});

export type AuditLogDto = z.infer<typeof auditLogDto>;
export type AuditListQuery = z.infer<typeof auditListQuery>;
