import type { UpsertPlaceBody } from "@ancla/contracts";
import { db, type EditorialState, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const placeInclude = {
  translations: true,
} satisfies Prisma.PlaceInclude;

export type PlaceRow = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

const CURRENT_REVISION_STATES: EditorialState[] = [
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "PUBLISHED",
  "PAUSED",
];

/** Places that are not deleted, by their order. */
export function listPlaceRows(organizationId: string): Promise<PlaceRow[]> {
  return forOrganization(db, organizationId).place.findMany({
    where: { deletedAt: null },
    include: placeInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export function findPlaceRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<PlaceRow | null> {
  return client.place.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: placeInclude,
  });
}

/** The `id` when it is a live place of the organization, for checks before a write. */
export async function placeExists(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const count = await tx.place.count({
    where: { id, organizationId, deletedAt: null },
  });
  return count > 0;
}

const translationRows = (translations: UpsertPlaceBody["translations"]) =>
  Object.entries(translations).map(([locale, { name }]) => ({ locale, name }));

export function createPlaceRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertPlaceBody,
): Promise<PlaceRow> {
  return tx.place.create({
    data: {
      organizationId,
      address: body.address,
      mapsUrl: body.mapsUrl,
      order: body.order,
      translations: { create: translationRows(body.translations) },
    },
    include: placeInclude,
  });
}

/**
 * Lock by `version`: replaces the fields and the whole set of translations only if the row is
 * still the one the editor loaded. `false` means someone saved first.
 */
export async function replacePlaceIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertPlaceBody,
): Promise<boolean> {
  const { count } = await tx.place.updateMany({
    where: { ...where, deletedAt: null },
    data: {
      address: body.address,
      mapsUrl: body.mapsUrl,
      order: body.order,
      version: { increment: 1 },
    },
  });
  if (count === 0) return false;
  await tx.placeTranslation.deleteMany({ where: { placeId: where.id } });
  await tx.placeTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      placeId: where.id,
    })),
  });
  return true;
}

export async function softDeletePlace(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.place.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

/** A live activity, or an event (in any of its revisions that still count), points at the place. */
export async function isPlaceInUse(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const usedByActivity = await tx.recurringActivity.count({
    where: { organizationId, placeId: id, deletedAt: null },
  });
  if (usedByActivity > 0) return true;
  // Events keep the place inside their snapshot, not in a column; superseded revisions do not count.
  const usedByEvent = await tx.contentRevision.count({
    where: {
      organizationId,
      contentType: "EVENT",
      state: { in: CURRENT_REVISION_STATES },
      snapshot: { path: ["placeId"], equals: id },
    },
  });
  return usedByEvent > 0;
}
