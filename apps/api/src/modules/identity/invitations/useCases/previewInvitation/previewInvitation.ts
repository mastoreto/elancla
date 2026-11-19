import type { InvitationPreviewDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../../core/errors";
import { findPendingInvitationRowByTokenHash } from "../../data";
import { hashInvitationToken, maskEmail } from "../../domain";

/** One message for every failure, so the response never says whether a token is used, expired or unknown. */
export const INVALID_INVITATION_MESSAGE = "This invitation link is not valid";

export async function previewInvitation(
  token: string,
): Promise<InvitationPreviewDto> {
  const invitation = await findPendingInvitationRowByTokenHash(
    hashInvitationToken(token),
  );
  if (!invitation) throw new NotFoundError(INVALID_INVITATION_MESSAGE);
  return {
    maskedEmail: maskEmail(invitation.email),
    organizationName: invitation.organization.name,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}
