import type { UpsertMinistryCategoryBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const categoryInclude = {
  translations: true,
} satisfies Prisma.MinistryCategoryInclude;

export type MinistryCategoryRow = Prisma.MinistryCategoryGetPayload<{
  include: typeof categoryInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

/** Categories that are not deleted, by their order. */
export function listCategoryRows(
  organizationId: string,
): Promise<MinistryCategoryRow[]> {
  return forOrganization(db, organizationId).ministryCategory.findMany({
    where: { deletedAt: null },
    include: categoryInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export function findCategoryRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<MinistryCategoryRow | null> {
  return client.ministryCategory.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: categoryInclude,
  });
}

const translationRows = (
  translations: UpsertMinistryCategoryBody["translations"],
) =>
  Object.entries(translations).map(([locale, { name }]) => ({ locale, name }));

export function createCategoryRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertMinistryCategoryBody,
): Promise<MinistryCategoryRow> {
  return tx.ministryCategory.create({
    data: {
      organizationId,
      order: body.order,
      translations: { create: translationRows(body.translations) },
    },
    include: categoryInclude,
  });
}

/**
 * Lock by `version`: replaces the order and the whole set of translations only if the row is
 * still the one the editor loaded. `false` means someone saved first.
 */
export async function replaceCategoryIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertMinistryCategoryBody,
): Promise<boolean> {
  const { count } = await tx.ministryCategory.updateMany({
    where: { ...where, deletedAt: null },
    data: { order: body.order, version: { increment: 1 } },
  });
  if (count === 0) return false;
  await tx.ministryCategoryTranslation.deleteMany({
    where: { categoryId: where.id },
  });
  await tx.ministryCategoryTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      categoryId: where.id,
    })),
  });
  return true;
}

export async function softDeleteCategory(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.ministryCategory.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

export async function isCategoryInUse(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<boolean> {
  const used = await tx.ministry.count({
    where: { organizationId, categoryId: id },
  });
  return used > 0;
}
