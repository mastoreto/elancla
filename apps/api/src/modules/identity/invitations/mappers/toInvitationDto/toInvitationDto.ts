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
    role: invitation.role === "admin" ? "admin" : "viewer",
    status: resolveInvitationStatus(invitation, now),
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}
