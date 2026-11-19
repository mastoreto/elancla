import { ADMIN_ROLE_KEY } from "@ancla/contracts";
import { db } from "@ancla/db";
import { pendingInvitationWhere } from "../../../../core/auth";
import { forOrganization } from "../../../../core/tenancy";

export interface NewInvitation {
  organizationId: string;
  email: string;
  tokenHash: string;
  roleIds: string[];
  ministryIds: string[];
  invitedById: string | null;
  expiresAt: Date;
}

export function createInvitationRow(input: NewInvitation) {
  return forOrganization(db, input.organizationId).invitation.create({
    data: input,
  });
}

export function listInvitationRows(
  organizationId: string,
  page: { cursor?: string; limit: number },
) {
  return forOrganization(db, organizationId).invitation.findMany({
    orderBy: { id: "desc" },
    // One extra row tells `toPage` whether there is a next page.
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
}

export function findInvitationRow(organizationId: string, id: string) {
  return forOrganization(db, organizationId).invitation.findFirst({
    where: { id },
  });
}

export function findPendingInvitationRowByEmail(
  organizationId: string,
  email: string,
) {
  return forOrganization(db, organizationId).invitation.findFirst({
    where: { email, ...pendingInvitationWhere(new Date()) },
  });
}

/**
 * Public lookup by token hash. Deliberately not tenant-scoped: the caller has no session, and the
 * 256-bit token is the capability that identifies the row (and therefore its organization).
 */
export function findPendingInvitationRowByTokenHash(tokenHash: string) {
  return db.invitation.findFirst({
    where: { tokenHash, ...pendingInvitationWhere(new Date()) },
    include: { organization: { select: { name: true } } },
  });
}

export function findInvitationAcceptedAt(id: string) {
  return db.invitation.findUnique({
    where: { id },
    select: { acceptedAt: true },
  });
}

export function markInvitationRevoked(organizationId: string, id: string) {
  return forOrganization(db, organizationId).invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export function rotateInvitationToken(
  organizationId: string,
  id: string,
  input: { tokenHash: string; expiresAt: Date },
) {
  return forOrganization(db, organizationId).invitation.update({
    where: { id },
    data: input,
  });
}

export function userExistsByEmail(email: string): Promise<boolean> {
  return db.user.count({ where: { email } }).then((count) => count > 0);
}

export function findOrganizationName(organizationId: string) {
  return db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { name: true },
  });
}

/** Ids among `ids` that exist in the organization, so an invitation never carries a foreign id. */
export async function findExistingRoleIds(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await forOrganization(db, organizationId).role.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function findExistingMinistryIds(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await forOrganization(db, organizationId).ministry.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

/** Names of the roles an invitation grants, for the email. */
export async function findRoleNames(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  const rows = await forOrganization(db, organizationId).role.findMany({
    where: { id: { in: ids } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((row) => row.name);
}

/** Whether the admin role (implicit full access) is among `ids`. */
export async function includesAdminRole(
  organizationId: string,
  ids: string[],
): Promise<boolean> {
  const count = await forOrganization(db, organizationId).role.count({
    where: { id: { in: ids }, key: ADMIN_ROLE_KEY },
  });
  return count > 0;
}
