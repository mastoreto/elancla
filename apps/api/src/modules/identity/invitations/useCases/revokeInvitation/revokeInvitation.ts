import { AUDIT_ACTIONS, type InvitationDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError, NotFoundError } from "../../../../../core/errors";
import { findInvitationRow, markInvitationRevoked } from "../../data";
import { toInvitationDto } from "../../mappers";

export async function revokeInvitation(
  ctx: AuthenticatedContext,
  id: string,
): Promise<InvitationDto> {
  const invitation = await findInvitationRow(ctx.organizationId, id);
  if (!invitation) throw new NotFoundError("The invitation was not found");
  if (invitation.acceptedAt)
    throw new ConflictError("The invitation was already accepted");
  const now = new Date();
  // Revoking twice is harmless: keep the first revocation date, and record nothing new.
  if (invitation.revokedAt) return toInvitationDto(invitation, now);
  const revoked = await withTransaction(db, async (tx) => {
    const updated = await markInvitationRevoked(tx, ctx.organizationId, id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.invitation.revoked,
      entity: { type: "invitation", id },
      before: toInvitationDto(invitation, now),
      after: toInvitationDto(updated, now),
      metadata: { entityLabel: updated.email },
    });
    return updated;
  });
  return toInvitationDto(revoked, now);
}
