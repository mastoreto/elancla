import { db } from "@ancla/db";
import type { AuditSource } from "../auditSource";
import { type AuditEvent, writeAudit } from "../writeAudit";

/**
 * For events that no business change contains (denials, logins): a failing log must not turn a
 * 403 into a 500 or break a login that already happened, so the failure is only reported.
 * Mutations never use this: theirs is strict and rolls back with the change.
 */
export async function writeAuditBestEffort(
  source: AuditSource,
  event: AuditEvent,
): Promise<void> {
  try {
    await writeAudit(db, source, event);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "audit write failed",
        action: event.action,
        requestId: source.requestId,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
