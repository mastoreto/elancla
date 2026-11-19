import type { CreateInvitationBody } from "@ancla/contracts";
import type { Invitation } from "@ancla/db";
import { auditSourceFrom } from "../../../../../core/audit";
import { assertCanAssignRoles } from "../../../../../core/authz";
import type { AuthenticatedContext } from "../../../../../core/context";
import { ForbiddenError } from "../../../../../core/errors";
import type { Mailer } from "../../../../../core/mail";
import { includesAdminRole } from "../../data";
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
  // Same rule as `PUT /users/:id/roles`: an invitation must not be a way around it.
  if (
    !ctx.access.isAdmin &&
    (await includesAdminRole(ctx.organizationId, body.roleIds))
  ) {
    throw new ForbiddenError("Only an admin can invite with the admin role");
  }
  await assertCanAssignRoles(ctx, body.roleIds);
  const { invitation, token } = await issueInvitation({
    organizationId: ctx.organizationId,
    email: body.email,
    roleIds: body.roleIds,
    ministryIds: body.ministryIds,
    invitedById: ctx.user.id,
    audit: auditSourceFrom(ctx, ctx.organizationId),
  });
  await sendInvitationEmail({
    mailer,
    invitation,
    token,
    inviterName: ctx.user.name,
  });
  return invitation;
}
