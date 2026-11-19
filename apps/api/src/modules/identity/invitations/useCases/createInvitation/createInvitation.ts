import type { CreateInvitationBody } from "@ancla/contracts";
import type { Invitation } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../../core/context";
import type { Mailer } from "../../../../../core/mail";
import { issueInvitation } from "../issueInvitation";
import { sendInvitationEmail } from "../sendInvitationEmail";

interface CreateInvitationInput {
  ctx: AuthenticatedContext;
  body: CreateInvitationBody;
  mailer: Mailer;
}

export async function createInvitation({
  ctx,
  body,
  mailer,
}: CreateInvitationInput): Promise<Invitation> {
  const { invitation, token } = await issueInvitation({
    organizationId: ctx.organizationId,
    email: body.email,
    roleIds: body.roleIds,
    ministryIds: body.ministryIds,
    invitedById: ctx.user.id,
  });
  await sendInvitationEmail({
    mailer,
    invitation,
    token,
    inviterName: ctx.user.name,
  });
  return invitation;
}
