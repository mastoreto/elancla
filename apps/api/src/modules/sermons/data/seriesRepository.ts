import { db, type Prisma } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

type Client = Prisma.TransactionClient | typeof db;

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
