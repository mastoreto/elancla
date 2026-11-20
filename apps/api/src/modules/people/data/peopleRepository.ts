import type { UpsertPersonProfileBody } from "@ancla/contracts";
import { db, Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";
import { CONTEXT_TO_DB } from "../domain";

const personInclude = {
  photo: true,
  translations: true,
  roles: { include: { translations: true } },
} satisfies Prisma.PersonProfileInclude;

export type PersonRow = Prisma.PersonProfileGetPayload<{
  include: typeof personInclude;
}>;

export function listPersonRows(organizationId: string): Promise<PersonRow[]> {
  return forOrganization(db, organizationId).personProfile.findMany({
    include: personInclude,
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export function findPersonRow(
  client: Prisma.TransactionClient | typeof db,
  organizationId: string,
  id: string,
): Promise<PersonRow | null> {
  return client.personProfile.findFirst({
    where: { id, organizationId },
    include: personInclude,
  });
}

export function findOrganizationLocaleConfig(
  tx: Prisma.TransactionClient,
  organizationId: string,
) {
  return tx.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}

/** A photo is valid when it is a finished public image of the organization. */
export async function isReadyContentImage(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const row = await tx.mediaFile.findFirst({
    where: { id, organizationId, purpose: "contentImage", status: "ready" },
    select: { id: true },
  });
  return row !== null;
}

/**
 * ponytail: `users` has no tenant column; belonging to the organization means holding one of its
 * roles (the same notion of membership the invitation flow creates).
 */
export async function isOrganizationMember(
  tx: Prisma.TransactionClient,
  organizationId: string,
  userId: string,
): Promise<boolean> {
  const row = await tx.user.findFirst({
    where: { id: userId, userRoles: { some: { role: { organizationId } } } },
    select: { id: true },
  });
  return row !== null;
}

/** The profile (other than `exceptId`) already linked to the user, if any. */
export async function isUserLinkedElsewhere(
  tx: Prisma.TransactionClient,
  input: { organizationId: string; userId: string; exceptId?: string },
): Promise<boolean> {
  const row = await tx.personProfile.findFirst({
    where: {
      organizationId: input.organizationId,
      userId: input.userId,
      ...(input.exceptId ? { id: { not: input.exceptId } } : {}),
    },
    select: { id: true },
  });
  return row !== null;
}

/** True for the unique-constraint error of `(organizationId, userId)`. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function translationRows(
  translations: UpsertPersonProfileBody["translations"],
) {
  return Object.entries(translations).map(([locale, { bio }]) => ({
    locale,
    bio,
  }));
}

function roleRows(roles: UpsertPersonProfileBody["roles"]) {
  return roles.map((role) => ({
    context: CONTEXT_TO_DB[role.context],
    visible: role.visible,
    order: role.order,
    translations: {
      create: Object.entries(role.translations).map(([locale, { title }]) => ({
        locale,
        title,
      })),
    },
  }));
}

export function createPersonRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertPersonProfileBody,
): Promise<PersonRow> {
  return tx.personProfile.create({
    data: {
      organizationId,
      name: body.name,
      photoId: body.photoId,
      userId: body.userId,
      translations: { create: translationRows(body.translations) },
      roles: { create: roleRows(body.roles) },
    },
    include: personInclude,
  });
}

/**
 * Replaces the profile: the fields, the bios of the locales sent and the whole list of roles
 * (their titles go with them in cascade). The children are cleared first, in separate statements,
 * so the unique keys never see the old and the new row together.
 */
export async function replacePersonRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
  body: UpsertPersonProfileBody,
): Promise<PersonRow> {
  await tx.personProfileTranslation.deleteMany({
    where: {
      personProfileId: id,
      locale: { in: Object.keys(body.translations) },
    },
  });
  await tx.personRole.deleteMany({ where: { personProfileId: id } });
  return tx.personProfile.update({
    where: { id, organizationId },
    data: {
      name: body.name,
      photoId: body.photoId,
      userId: body.userId,
      translations: { create: translationRows(body.translations) },
      roles: { create: roleRows(body.roles) },
    },
    include: personInclude,
  });
}

export async function deletePersonRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.personProfile.delete({ where: { id, organizationId } });
}
