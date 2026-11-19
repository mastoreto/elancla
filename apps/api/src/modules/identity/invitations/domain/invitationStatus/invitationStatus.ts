import type { InvitationStatus } from "@ancla/contracts";

interface InvitationLifecycle {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}

/** One state from the three timestamps: accepted wins over revoked, which wins over expired. */
export function resolveInvitationStatus(
  invitation: InvitationLifecycle,
  now: Date,
): InvitationStatus {
  if (invitation.acceptedAt) return "accepted";
  if (invitation.revokedAt) return "revoked";
  return invitation.expiresAt <= now ? "expired" : "pending";
}
