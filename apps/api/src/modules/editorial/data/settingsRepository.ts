import {
  ADMIN_ROLE_KEY,
  type UpdateEditorialSettingsBody,
} from "@ancla/contracts";
import type { EditorialContentType, Prisma } from "@ancla/db";
import { db } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { NO_REVIEW_SETTINGS, type ReviewSettings } from "../domain";

export function listSettingsRows(organizationId: string) {
  return forOrganization(db, organizationId).editorialSettings.findMany();
}

/** The settings of a type; a type nobody configured has no reviewers and no mandatory review. */
export async function findReviewSettings(
  client: Prisma.TransactionClient | typeof db,
  organizationId: string,
  contentType: EditorialContentType,
): Promise<ReviewSettings> {
  const row = await client.editorialSettings.findUnique({
    where: { organizationId_contentType: { organizationId, contentType } },
  });
  return row ?? NO_REVIEW_SETTINGS;
}

export function upsertSettingsRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  contentType: EditorialContentType,
  body: UpdateEditorialSettingsBody,
) {
  return tx.editorialSettings.upsert({
    where: { organizationId_contentType: { organizationId, contentType } },
    create: { organizationId, contentType, ...body },
    update: body,
  });
}

export async function findExistingRoleIds(
  organizationId: string,
  ids: string[],
): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await forOrganization(db, organizationId).role.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

/** ponytail: users have no tenant column and there is one organization, so any user belongs to it. */
export async function findExistingUserIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await db.user.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function findRoleIdsOfUser(
  client: Prisma.TransactionClient | typeof db,
  userId: string,
): Promise<string[]> {
  const rows = await client.userRole.findMany({
    where: { userId },
    select: { roleId: true },
  });
  return rows.map((row) => row.roleId);
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
}

const RECIPIENT = { select: { id: true, name: true, email: true } } as const;

/** Users named in the settings, directly or through a role. Stale ids match nobody. */
export function findConfiguredReviewers(
  organizationId: string,
  settings: ReviewSettings,
): Promise<Recipient[]> {
  return db.user.findMany({
    where: {
      OR: [
        { id: { in: [...settings.reviewerUserIds] } },
        {
          userRoles: {
            some: {
              roleId: { in: [...settings.reviewerRoleIds] },
              role: { organizationId },
            },
          },
        },
      ],
    },
    ...RECIPIENT,
  });
}

export function findAdminUsers(organizationId: string): Promise<Recipient[]> {
  return db.user.findMany({
    where: {
      userRoles: { some: { role: { organizationId, key: ADMIN_ROLE_KEY } } },
    },
    ...RECIPIENT,
  });
}

export function findUserRecipient(id: string): Promise<Recipient | null> {
  return db.user.findUnique({ where: { id }, ...RECIPIENT });
}

export async function findOrganizationName(
  organizationId: string,
): Promise<string> {
  const row = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: { name: true },
  });
  return row.name;
}
