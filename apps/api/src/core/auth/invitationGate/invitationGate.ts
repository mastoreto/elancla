import { db, type PrismaClient } from "@ancla/db";
import { APIError } from "better-auth/api";

export const INVITATION_REQUIRED_CODE = "INVITATION_REQUIRED";
export const PROVIDER_EMAIL_NOT_VERIFIED_CODE = "PROVIDER_EMAIL_NOT_VERIFIED";

/** An invitation that can still be used to sign up. `now` is injected to keep it testable. */
export function pendingInvitationWhere(now: Date) {
  return { acceptedAt: null, revokedAt: null, expiresAt: { gt: now } };
}

/** The newest pending invitation for an email, whatever its organization (single tenant today). */
export function findPendingInvitation(client: PrismaClient, email: string) {
  return client.invitation.findFirst({
    where: {
      email: email.toLowerCase(),
      ...pendingInvitationWhere(new Date()),
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Better Auth runs this before any user row is created: it is the single door for sign-ups. */
export async function assertSignUpAllowed(input: {
  email: string;
  emailVerified: boolean;
  isCredentialSignUp: boolean;
}): Promise<void> {
  const invitation = await findPendingInvitation(db, input.email);
  if (!invitation) {
    throw new APIError("FORBIDDEN", {
      code: INVITATION_REQUIRED_CODE,
      message: "An invitation is required to create an account",
    });
  }
  // A password sign-up proves the email through the invitation link itself; any provider must
  // vouch for the address.
  if (!(input.isCredentialSignUp || input.emailVerified)) {
    throw new APIError("FORBIDDEN", {
      code: PROVIDER_EMAIL_NOT_VERIFIED_CODE,
      message: "The provider did not verify this email address",
    });
  }
}

/**
 * Marks the pending invitation of a freshly created user as used and gives the user the roles and
 * ministries it carried. Ids that no longer exist (a role deleted after inviting) are skipped.
 */
export async function markInvitationAccepted(user: {
  id: string;
  email: string;
}): Promise<void> {
  const invitation = await findPendingInvitation(db, user.email);
  if (!invitation) return;
  const { organizationId } = invitation;
  await db.$transaction(async (tx) => {
    const roles = await tx.role.findMany({
      where: { organizationId, id: { in: invitation.roleIds } },
      select: { id: true },
    });
    const ministries = await tx.ministry.findMany({
      where: { organizationId, id: { in: invitation.ministryIds } },
      select: { id: true },
    });
    await tx.userRole.createMany({
      data: roles.map((role) => ({ userId: user.id, roleId: role.id })),
      skipDuplicates: true,
    });
    await tx.userMinistry.createMany({
      data: ministries.map((ministry) => ({
        userId: user.id,
        ministryId: ministry.id,
      })),
      skipDuplicates: true,
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
  });
}
