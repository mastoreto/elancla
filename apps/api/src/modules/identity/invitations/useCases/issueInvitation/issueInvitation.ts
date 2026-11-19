import type { Invitation } from "@ancla/db";
import { ConflictError, ValidationError } from "../../../../../core/errors";
import {
  createInvitationRow,
  findExistingMinistryIds,
  findExistingRoleIds,
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
  roleIds: string[];
  ministryIds: string[];
  invitedById: string | null;
}

export interface IssuedInvitation {
  invitation: Invitation;
  /** The only moment the plain token exists on the server; it goes into the email or the script output. */
  token: string;
}

async function assertKnownIds(
  field: "roleIds" | "ministryIds",
  requested: string[],
  existing: string[],
): Promise<void> {
  const known = new Set(existing);
  if (requested.every((id) => known.has(id))) return;
  throw new ValidationError("The request is not valid", [
    { path: field, message: "Contains an id that does not exist" },
  ]);
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
  const roleIds = [...new Set(input.roleIds)];
  const ministryIds = [...new Set(input.ministryIds)];
  await assertKnownIds(
    "roleIds",
    roleIds,
    await findExistingRoleIds(input.organizationId, roleIds),
  );
  await assertKnownIds(
    "ministryIds",
    ministryIds,
    await findExistingMinistryIds(input.organizationId, ministryIds),
  );
  const token = generateInvitationToken();
  const invitation = await createInvitationRow({
    organizationId: input.organizationId,
    email,
    tokenHash: hashInvitationToken(token),
    roleIds,
    ministryIds,
    invitedById: input.invitedById,
    expiresAt: invitationExpiry(new Date()),
  });
  return { invitation, token };
}
