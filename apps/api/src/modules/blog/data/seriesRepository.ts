import type { UpsertSeriesBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

const seriesInclude = {
  translations: true,
} satisfies Prisma.SeriesInclude;

export type SeriesRow = Prisma.SeriesGetPayload<{
  include: typeof seriesInclude;
}>;

type Client = Prisma.TransactionClient | typeof db;

/** Series that are not deleted, oldest first (a v7 id is time ordered). */
export function listSeriesRows(organizationId: string): Promise<SeriesRow[]> {
  return forOrganization(db, organizationId).series.findMany({
    where: { deletedAt: null },
    include: seriesInclude,
    orderBy: { id: "asc" },
  });
}

export function findSeriesRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<SeriesRow | null> {
  return client.series.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: seriesInclude,
  });
}

const translationRows = (translations: UpsertSeriesBody["translations"]) =>
  Object.entries(translations).map(([locale, { name, slug, description }]) => ({
    locale,
    name,
    slug,
    description: description || null,
  }));

export function createSeriesRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertSeriesBody,
): Promise<SeriesRow> {
  return tx.series.create({
    data: {
      organizationId,
      translations: { create: translationRows(body.translations) },
    },
    include: seriesInclude,
  });
}

/** Same lock as the categories: replaces the translations only if the `version` still matches. */
export async function replaceSeriesIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertSeriesBody,
): Promise<boolean> {
  const { count } = await tx.series.updateMany({
    where: { ...where, deletedAt: null },
    data: { version: { increment: 1 } },
  });
  if (count === 0) return false;
  await tx.seriesTranslation.deleteMany({ where: { seriesId: where.id } });
  await tx.seriesTranslation.createMany({
    data: translationRows(body.translations).map((row) => ({
      ...row,
      seriesId: where.id,
    })),
  });
  return true;
}

export async function softDeleteSeries(
  tx: Prisma.TransactionClient,
  organizationId: string,
  id: string,
): Promise<void> {
  await tx.series.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  });
}

export function findTakenSeriesSlug(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    slugs: readonly { locale: string; slug: string }[];
    exceptId?: string;
  },
): Promise<{ locale: string; slug: string } | null> {
  return tx.seriesTranslation.findFirst({
    where: {
      OR: input.slugs.map(({ locale, slug }) => ({ locale, slug })),
      series: {
        organizationId: input.organizationId,
        deletedAt: null,
        ...(input.exceptId ? { id: { not: input.exceptId } } : {}),
      },
    },
    select: { locale: true, slug: true },
  });
}
