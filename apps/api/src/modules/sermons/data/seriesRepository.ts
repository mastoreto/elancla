import type { UpsertSermonSeriesBody } from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

type Client = Prisma.TransactionClient | typeof db;

const seriesInclude = {
  translations: true,
  coverMedia: true,
} satisfies Prisma.SermonSeriesInclude;

export type SeriesRow = Prisma.SermonSeriesGetPayload<{
  include: typeof seriesInclude;
}>;

/** Series that are not deleted, in the order the editors set (then oldest first: a v7 id is time ordered). */
export function listSeriesRows(organizationId: string): Promise<SeriesRow[]> {
  return forOrganization(db, organizationId).sermonSeries.findMany({
    where: { deletedAt: null },
    include: seriesInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

export function findSeriesRow(
  client: Client,
  organizationId: string,
  id: string,
): Promise<SeriesRow | null> {
  return client.sermonSeries.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: seriesInclude,
  });
}

/** A series that is not deleted, or `null`. */
export function findSeriesId(
  client: Client,
  organizationId: string,
  id: string,
): Promise<{ id: string } | null> {
  return client.sermonSeries.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: { id: true },
  });
}

/** The series (not deleted) already imported from this playlist, if any. */
export function findSeriesIdByPlaylist(
  client: Client,
  organizationId: string,
  youtubePlaylistId: string,
): Promise<{ id: string } | null> {
  return client.sermonSeries.findFirst({
    where: { organizationId, youtubePlaylistId, deletedAt: null },
    select: { id: true },
  });
}

/** The slugs the series of the organization already use in a language (deleted ones do not count). */
export async function listSeriesSlugs(
  client: Client,
  organizationId: string,
  locale: string,
): Promise<Set<string>> {
  const rows = await client.sermonSeriesTranslation.findMany({
    where: { locale, series: { organizationId, deletedAt: null } },
    select: { slug: true },
  });
  return new Set(rows.map((row) => row.slug));
}

export interface MinimalSeries {
  locale: string;
  title: string;
  slug: string;
}

/** A series with just a title in one language; the editor completes it from the series screen. */
export function createMinimalSeriesRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  { locale, title, slug }: MinimalSeries,
): Promise<{ id: string }> {
  return tx.sermonSeries.create({
    data: {
      organizationId,
      translations: { create: { locale, title, slug, description: null } },
    },
    select: { id: true },
  });
}

const translationRows = (
  translations: UpsertSermonSeriesBody["translations"],
) =>
  Object.entries(translations).map(
    ([locale, { title, slug, description, tags }]) => ({
      locale,
      title,
      slug,
      description: description || null,
      tags,
    }),
  );

export function createSeriesRow(
  tx: Prisma.TransactionClient,
  organizationId: string,
  body: UpsertSermonSeriesBody,
  youtubePlaylistId: string | null = null,
): Promise<SeriesRow> {
  return tx.sermonSeries.create({
    data: {
      organizationId,
      coverMediaId: body.coverMediaId,
      plannedCount: body.plannedCount,
      order: body.order,
      youtubePlaylistId,
      translations: { create: translationRows(body.translations) },
    },
    include: seriesInclude,
  });
}

/** Replaces the fields and the translations only if the `version` still matches (the optimistic lock). */
export async function replaceSeriesIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  body: UpsertSermonSeriesBody,
): Promise<boolean> {
  const { count } = await tx.sermonSeries.updateMany({
    where: { ...where, deletedAt: null },
    data: {
      coverMediaId: body.coverMediaId,
      plannedCount: body.plannedCount,
      order: body.order,
      version: { increment: 1 },
    },
  });
  if (count === 0) return false;
  await tx.sermonSeriesTranslation.deleteMany({
    where: { seriesId: where.id },
  });
  await tx.sermonSeriesTranslation.createMany({
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
  await tx.sermonSeries.updateMany({
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
  return tx.sermonSeriesTranslation.findFirst({
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

/** Titles the CRM list shows: series of any state (deleted ones too) by id, with every language. */
export function findSeriesTitles(
  organizationId: string,
  ids: readonly string[],
): Promise<
  { id: string; translations: { locale: string; title: string }[] }[]
> {
  return forOrganization(db, organizationId).sermonSeries.findMany({
    where: { id: { in: [...ids] } },
    select: {
      id: true,
      translations: { select: { locale: true, title: true } },
    },
  });
}

/** Names the CRM list shows for the preachers (any person, by id). */
export function findPreacherNames(
  organizationId: string,
  ids: readonly string[],
): Promise<{ id: string; name: string }[]> {
  return forOrganization(db, organizationId).personProfile.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, name: true },
  });
}
