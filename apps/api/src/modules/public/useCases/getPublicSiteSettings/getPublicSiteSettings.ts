import type { PublicSiteSettingsDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import {
  findOrganizationLocales,
  findSiteSettingsWithTranslations,
} from "../../data";
import { resolvePublicLocale } from "../../domain";
import { toPublicSiteSettingsDto } from "../../mappers";

/**
 * The site settings in the requested language. Texts that are not translated yet come in the
 * organization's default language, and `locale` says which one was served.
 */
export async function getPublicSiteSettings(
  organizationId: string,
  requestedLocale: string | undefined,
): Promise<PublicSiteSettingsDto> {
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const settings = await findSiteSettingsWithTranslations(organizationId, [
    locale,
    defaultLocale,
  ]);
  if (!settings) throw new NotFoundError("The site settings were not found");
  const seoDescriptionOf = (wanted: string): string | null =>
    settings.translations.find((row) => row.locale === wanted)
      ?.seoDescription ?? null;
  // A language with no description of its own serves the default one's, and `locale` says so.
  const ownDescription = seoDescriptionOf(locale);
  return toPublicSiteSettingsDto(
    settings,
    ownDescription ?? seoDescriptionOf(defaultLocale),
    ownDescription === null ? defaultLocale : locale,
  );
}
