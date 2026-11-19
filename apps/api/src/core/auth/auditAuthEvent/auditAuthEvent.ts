import {
  type AuditActor,
  type AuditEvent,
  auditSourceFromHeaders,
  writeAuditBestEffort,
} from "../../audit";
import { resolveOrganizationId } from "../../tenancy";

/**
 * Records an event raised by Better Auth code (hooks, mail callbacks), which has raw headers and
 * no request context. Best effort end to end: nothing here may break the sign-in or the mail.
 */
export async function auditAuthEvent(
  headers: Headers | undefined,
  actor: AuditActor | null,
  event: AuditEvent,
): Promise<void> {
  try {
    await writeAuditBestEffort(
      auditSourceFromHeaders(headers, await resolveOrganizationId(), actor),
      event,
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "audit source could not be built",
        action: event.action,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
