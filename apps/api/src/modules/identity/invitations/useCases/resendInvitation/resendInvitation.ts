import { AUDIT_ACTIONS, type InvitationDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../../core/audit";
import type { AuthenticatedContext } from "../../../../../core/context";
import { withTransaction } from "../../../../../core/db";
import { ConflictError, NotFoundError } from "../../../../../core/errors";
import type { Mailer } from "../../../../../core/mail";
import { findInvitationRow, rotateInvitationToken } from "../../data";
import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
} from "../../domain";
import { toInvitationDto } from "../../mappers";
import { sendInvitationEmail } from "../sendInvitationEmail";

interface ResendInvitationInput {
  ctx: AuthenticatedContext;
  id: string;
  mailer: Mailer;
}

/**
 * Only the token hash is stored, so a resend cannot repeat the old link: it rotates the token
 * (the previous link stops working) and restarts the validity window. The email goes out after
 * the commit, so a rolled-back rotation never mails a dead link.
 */
export async function resendInvitation({
  ctx,
  id,
  mailer,
}: ResendInvitationInput): Promise<InvitationDto> {
  const invitation = await findInvitationRow(ctx.organizationId, id);
  if (!invitation) throw new NotFoundError("The invitation was not found");
  if (invitation.acceptedAt || invitation.revokedAt) {
    throw new ConflictError(
      "Only a pending or expired invitation can be resent",
    );
  }
  const token = generateInvitationToken();
  const now = new Date();
  const rotated = await withTransaction(db, async (tx) => {
    const updated = await rotateInvitationToken(tx, ctx.organizationId, id, {
      tokenHash: hashInvitationToken(token),
      expiresAt: invitationExpiry(now),
    });
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.invitation.resent,
      entity: { type: "invitation", id },
      before: toInvitationDto(invitation, now),
      after: toInvitationDto(updated, now),
      metadata: { entityLabel: updated.email },
    });
    return updated;
  });
  await sendInvitationEmail({
    mailer,
    invitation: rotated,
    token,
    inviterName: ctx.user.name,
  });
  return toInvitationDto(rotated, now);
}
