import type { MinistryLandingBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

type Client = Prisma.TransactionClient | typeof db;

export type MinistryRow = Prisma.MinistryGetPayload<object>;

export function listMinistryRows(
  organizationId: string,
  scope: Record<string, unknown>,
  page: { cursor?: string; limit: number },
) {
  return forOrganization(db, organizationId).ministry.findMany({
    where: scope,
    orderBy: { id: "desc" },
    take: page.limit + 1,
    ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
  });
}

/** Every ministry the scope allows, by internal name: the CRM list is not paged (dozens at most). */
export function listMinistrySettingsRows(
  organizationId: string,
  scope: Record<string, unknown>,
): Promise<MinistryRow[]> {
  return forOrganization(db, organizationId).ministry.findMany({
    where: scope,
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

/** Every ministry of the organization, read inside a transaction (to see its own writes). */
export function listOrganizationMinistryRows(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<MinistryRow[]> {
  return tx.ministry.findMany({
    where: { organizationId },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export function findMinistryRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<MinistryRow | null> {
  return client.ministry.findFirst({ where: { id, organizationId } });
}

export async function isMinistrySlugTaken(
  tx: Prisma.TransactionClient,
  organizationId: string,
  slug: string,
): Promise<boolean> {
  const found = await tx.ministry.findFirst({
    where: { organizationId, slug },
    select: { id: true },
  });
  return found !== null;
}

export function createMinistryRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  input: { name: string; slug: string },
): Promise<MinistryRow> {
  return tx.ministry.create({ data: { organizationId, ...input } });
}

type SettingsData = Pick<
  Prisma.MinistryUncheckedUpdateManyInput,
  "categoryId" | "destination" | "externalUrl" | "icon" | "color"
>;

/**
 * Lock by `version`: applies the settings only if the row is still the one the editor loaded.
 * `false` means someone saved first.
 */
export async function updateSettingsIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  data: SettingsData,
): Promise<boolean> {
  const { count } = await tx.ministry.updateMany({
    where,
    data: { ...data, version: { increment: 1 } },
  });
  return count > 0;
}

/** The `ids` that belong to the organization, for checks before a bulk write. */
export async function findMinistryIds(
  tx: Prisma.TransactionClient,
  organizationId: string,
  ids: readonly string[],
): Promise<string[]> {
  const rows = await tx.ministry.findMany({
    where: { organizationId, id: { in: [...ids] } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

export async function updateLandingRows(
  tx: Prisma.TransactionClient,
  organizationId: string,
  tiles: MinistryLandingBody,
): Promise<void> {
  for (const tile of tiles) {
    await tx.ministry.updateMany({
      where: { id: tile.id, organizationId },
      data: {
        showOnLanding: tile.showOnLanding,
        landingOrder: tile.landingOrder,
        landingTile: tile.landingTile === "photo" ? "PHOTO" : "COLOR",
        landingTone: tile.landingTone,
        landingPhotoId: tile.landingPhotoId,
      },
    });
  }
}
