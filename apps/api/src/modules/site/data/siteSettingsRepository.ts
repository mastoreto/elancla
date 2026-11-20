import type { db, Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

export function findOrganizationLocaleConfig(
  client: Client,
  organizationId: string,
) {
  return client.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}

export function findSiteSettingsRow(client: Client, organizationId: string) {
  return client.siteSettings.findFirst({
    where: { organizationId },
    include: { translations: true },
  });
}

/** Lock by `version`: the row only changes if it is still the one the editor loaded. */
export async function updateSiteSettingsIfVersion(
  tx: Prisma.TransactionClient,
  where: { id: string; organizationId: string; version: number },
  data: Prisma.SiteSettingsUncheckedUpdateManyInput,
): Promise<boolean> {
  const { count } = await tx.siteSettings.updateMany({
    where,
    data: { ...data, version: { increment: 1 } },
  });
  return count > 0;
}

export function upsertSeoDescription(
  tx: Prisma.TransactionClient,
  input: {
    siteSettingsId: string;
    locale: string;
    seoDescription: string | null;
  },
) {
  const { siteSettingsId, locale, seoDescription } = input;
  return tx.siteSettingsTranslation.upsert({
    where: { siteSettingsId_locale: { siteSettingsId, locale } },
    create: { siteSettingsId, locale, seoDescription },
    update: { seoDescription },
  });
}
