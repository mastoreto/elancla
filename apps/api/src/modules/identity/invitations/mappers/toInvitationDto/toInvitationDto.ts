import type { InvitationDto } from "@ancla/contracts";
import type { Invitation } from "@ancla/db";
import { resolveInvitationStatus } from "../../domain";

/** Explicit field list: the token hash never leaves the API. */
export function toInvitationDto(
  invitation: Invitation,
  now: Date,
): InvitationDto {
  return {
    id: invitation.id,
    email: invitation.email,
    roleIds: invitation.roleIds,
    ministryIds: invitation.ministryIds,
    status: resolveInvitationStatus(invitation, now),
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}
