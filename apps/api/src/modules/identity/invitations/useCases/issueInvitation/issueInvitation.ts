import type { InvitationRole } from "@ancla/contracts";
import type { Invitation } from "@ancla/db";
import { ConflictError } from "../../../../../core/errors";
import {
  createInvitationRow,
  findPendingInvitationRowByEmail,
  userExistsByEmail,
} from "../../data";
import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
} from "../../domain";

export interface IssueInvitationInput {
  organizationId: string;
  email: string;
  role: InvitationRole;
  invitedById: string | null;
}

export interface IssuedInvitation {
  invitation: Invitation;
  /** The only moment the plain token exists on the server; it goes into the email or the script output. */
  token: string;
}

/** Creates the invitation row. Delivery (email or printed link) is the caller's business. */
export async function issueInvitation(
  input: IssueInvitationInput,
): Promise<IssuedInvitation> {
  const email = input.email.trim().toLowerCase();
  if (await userExistsByEmail(email)) {
    throw new ConflictError("A user with this email already exists");
  }
  if (await findPendingInvitationRowByEmail(input.organizationId, email)) {
    throw new ConflictError(
      "This email already has a pending invitation; resend it instead",
    );
  }
  const token = generateInvitationToken();
  const invitation = await createInvitationRow({
    organizationId: input.organizationId,
    email,
    tokenHash: hashInvitationToken(token),
    role: input.role,
    invitedById: input.invitedById,
    expiresAt: invitationExpiry(new Date()),
  });
  return { invitation, token };
}
