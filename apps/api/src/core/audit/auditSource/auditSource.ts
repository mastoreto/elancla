import type { RequestContext } from "../../context";
import { clientAddress } from "../../http/clientAddress";
import { REQUEST_ID_HEADER } from "../../http/requestId";

export const CLI_ACTOR_LABEL = "cli";

export interface AuditActor {
  /** `null` for actors that are not users (the CLI, the cron job). */
  id: string | null;
  /** Email (or "cli", "cron") frozen at the time of the event. */
  label: string;
}

/** Who did it, from where: everything `writeAudit` needs that is not the event itself. */
export interface AuditSource {
  organizationId: string;
  actor: AuditActor | null;
  requestId: string | null;
  ip: string | null;
  userAgent: string | null;
}

/** For routes and use cases: the request context already knows all of it. */
export function auditSourceFrom(
  ctx: RequestContext,
  organizationId: string,
): AuditSource {
  return {
    organizationId,
    actor: ctx.user ? { id: ctx.user.id, label: ctx.user.email } : null,
    requestId: ctx.requestId,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  };
}

/** For Better Auth hooks and other code that only has the raw request headers. */
export function auditSourceFromHeaders(
  headers: Headers | undefined,
  organizationId: string,
  actor: AuditActor | null,
): AuditSource {
  return {
    organizationId,
    actor,
    requestId: headers?.get(REQUEST_ID_HEADER) ?? null,
    ip: clientAddress(headers?.get("x-forwarded-for") ?? undefined),
    userAgent: headers?.get("user-agent") ?? null,
  };
}

/** For work that runs outside any request and has no user behind it (scripts, cron jobs). */
export function auditSourceForSystem(
  organizationId: string,
  label: string,
): AuditSource {
  return {
    organizationId,
    actor: { id: null, label },
    requestId: null,
    ip: null,
    userAgent: null,
  };
}

export function auditSourceForCli(organizationId: string): AuditSource {
  return auditSourceForSystem(organizationId, CLI_ACTOR_LABEL);
}
