import type { InvitationDto } from "@ancla/contracts";
import type { AuthenticatedContext } from "../../../../../core/context";
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
  // Revoking twice is harmless: keep the first revocation date.
  const revoked = invitation.revokedAt
    ? invitation
    : await markInvitationRevoked(ctx.organizationId, id);
  return toInvitationDto(revoked, new Date());
}
