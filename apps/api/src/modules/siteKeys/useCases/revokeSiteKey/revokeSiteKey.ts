import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import { findActiveSiteKeyRowIn, markSiteKeyRevoked } from "../../data";
import { toSiteKeyDto } from "../../mappers";

/** Soft revoke: the row stays, so the key keeps showing in the list and in the audit trail. */
export async function revokeSiteKey(
  ctx: AuthenticatedContext,
  id: string,
): Promise<void> {
  await withTransaction(db, async (tx) => {
    const current = await findActiveSiteKeyRowIn(tx, ctx.organizationId, id);
    if (!current) throw new NotFoundError("The site key was not found");
    const revoked = await markSiteKeyRevoked(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.siteApiKey.revoked,
      entity: { type: "siteApiKey", id },
      before: toSiteKeyDto(current),
      after: toSiteKeyDto(revoked),
      metadata: { entityLabel: current.name },
    });
  });
}
