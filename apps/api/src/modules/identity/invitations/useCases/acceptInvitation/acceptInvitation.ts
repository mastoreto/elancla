import type { AcceptInvitationBody } from "@ancla/contracts";
import { isAPIError } from "better-auth/api";
import { getAuth } from "../../../../../core/auth";
import { NotFoundError } from "../../../../../core/errors";
import {
  findInvitationAcceptedAt,
  findPendingInvitationRowByTokenHash,
} from "../../data";
import { hashInvitationToken } from "../../domain";
import { INVALID_INVITATION_MESSAGE } from "../previewInvitation";

interface AcceptInvitationInput {
  token: string;
  body: AcceptInvitationBody;
  /** Carries the request id, address and user agent down to the sign-up hook (audit). */
  headers: Headers;
}

/**
 * Creates the account behind a valid token. Better Auth's sign-up hook (core/auth) re-checks the
 * invitation, copies its role and marks it accepted; this use case only proves the token.
 */
export async function acceptInvitation({
  token,
  body,
  headers,
}: AcceptInvitationInput): Promise<void> {
  const invitation = await findPendingInvitationRowByTokenHash(
    hashInvitationToken(token),
  );
  if (!invitation) throw new NotFoundError(INVALID_INVITATION_MESSAGE);
  try {
    await getAuth().api.signUpEmail({
      body: {
        email: invitation.email,
        password: body.password,
        name: body.name,
      },
      headers,
    });
  } catch (error) {
    // A lost race (the address got an account meanwhile) must look like any other bad link.
    if (isAPIError(error)) throw new NotFoundError(INVALID_INVITATION_MESSAGE);
    throw error;
  }
  // With `autoSignIn: false` Better Auth answers a duplicate address as if it had worked.
  const outcome = await findInvitationAcceptedAt(invitation.id);
  if (!outcome?.acceptedAt) throw new NotFoundError(INVALID_INVITATION_MESSAGE);
}
