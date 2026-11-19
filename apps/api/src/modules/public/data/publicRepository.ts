import { db } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

/**
 * Lookup by key id for the guard. Deliberately not tenant-scoped: nothing is known about the
 * caller yet, and the key (id plus secret) is what identifies its organization.
 */
export function findSiteKeyForAuthentication(id: string) {
  return db.siteApiKey.findUnique({
    where: { id },
    select: {
      secretHash: true,
      revokedAt: true,
      organizationId: true,
      organization: { select: { slug: true } },
    },
  });
}

export function findOrganizationLocales(organizationId: string) {
  return db.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}

/** The settings with the translations of the two languages the response can use. */
export function findSiteSettingsWithTranslations(
  organizationId: string,
  locales: string[],
) {
  return forOrganization(db, organizationId).siteSettings.findFirst({
    include: { translations: { where: { locale: { in: locales } } } },
  });
}
