import type { UpsertCategoryBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const categoryInclude = {
  translations: true,
} satisfies Prisma.CategoryInclude;

export type CategoryRow = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

/** Categories that are not deleted, by their order. */
export function listCategoryRows(
  organizationId: string,
): Promise<CategoryRow[]> {
  return forOrganization(db, organizationId).category.findMany({
    where: { deletedAt: null },
    include: categoryInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export function findCategoryRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<CategoryRow | null> {
  return client.category.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: categoryInclude,
  });
}

const translationRows = (translations: UpsertCategoryBody["translations"]) =>
  Object.entries(translations).map(([locale, { name, slug }]) => ({
    locale,
    name,
    slug,
  }));

export function createCategoryRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertCategoryBody,
): Promise<CategoryRow> {
  return tx.category.create({
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
  body: UpsertCategoryBody,
): Promise<boolean> {
  const { count } = await tx.category.updateMany({
    where: { ...where, deletedAt: null },
    data: { order: body.order, version: { increment: 1 } },
  });
  if (count === 0) return false;
  await tx.categoryTranslation.deleteMany({ where: { categoryId: where.id } });
  await tx.categoryTranslation.createMany({
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
  await tx.category.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

/** The first (locale, slug) pair another live category already uses. */
export function findTakenCategorySlug(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    slugs: readonly { locale: string; slug: string }[];
    exceptId?: string;
  },
): Promise<{ locale: string; slug: string } | null> {
  return tx.categoryTranslation.findFirst({
    where: {
      OR: input.slugs.map(({ locale, slug }) => ({ locale, slug })),
      category: {
        organizationId: input.organizationId,
        deletedAt: null,
        ...(input.exceptId ? { id: { not: input.exceptId } } : {}),
      },
    },
    select: { locale: true, slug: true },
  });
}
