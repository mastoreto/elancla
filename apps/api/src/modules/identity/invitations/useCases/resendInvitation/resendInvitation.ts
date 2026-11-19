import type { InvitationDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
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
 * (the previous link stops working) and restarts the validity window.
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
  const rotated = await rotateInvitationToken(ctx.organizationId, id, {
    tokenHash: hashInvitationToken(token),
    expiresAt: invitationExpiry(new Date()),
  });
  await sendInvitationEmail({
    mailer,
    invitation: rotated,
    token,
    inviterName: ctx.user.name,
  });
  return toInvitationDto(rotated, new Date());
}
