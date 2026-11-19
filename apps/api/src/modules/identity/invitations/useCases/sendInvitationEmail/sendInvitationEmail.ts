import type { Invitation } from "@ancla/db";
import { renderInvitationEmail } from "@ancla/emails";
import { getApiEnv } from "../../../../../core/env";
import type { Mailer } from "../../../../../core/mail";
import { findOrganizationName, findRoleNames } from "../../data";
import { INVITATION_TTL_DAYS, invitationRoleCopy } from "../../domain";

const INVITATION_PATH = "/invitation";

export function buildInvitationUrl(token: string): string {
  return `${getApiEnv().CRM_ORIGIN}${INVITATION_PATH}/${token}`;
}

interface SendInvitationEmailInput {
  mailer: Mailer;
  invitation: Invitation;
  token: string;
  inviterName: string;
}

export async function sendInvitationEmail({
  mailer,
  invitation,
  token,
  inviterName,
}: SendInvitationEmailInput): Promise<void> {
  const organization = await findOrganizationName(invitation.organizationId);
  const roleNames = await findRoleNames(
    invitation.organizationId,
    invitation.roleIds,
  );
  const rendered = await renderInvitationEmail({
    churchName: organization.name,
    // ponytail: the invitation carries no name for the person, so the address greets them.
    recipientName: invitation.email.split("@")[0] ?? invitation.email,
    recipientEmail: invitation.email,
    inviterName,
    ...invitationRoleCopy(roleNames),
    acceptUrl: buildInvitationUrl(token),
    expiresInDays: INVITATION_TTL_DAYS,
  });
  await mailer.send({ to: invitation.email, ...rendered });
}
