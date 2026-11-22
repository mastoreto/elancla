import type { PublicSiteSettingsDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { getPublicServiceTimes } from "../../../calendar";
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
  now: Date = new Date(),
): Promise<PublicSiteSettingsDto> {
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales, timezone } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const [settings, serviceTimes] = await Promise.all([
    findSiteSettingsWithTranslations(organizationId, [locale, defaultLocale]),
    getPublicServiceTimes(organizationId, now),
  ]);
  if (!settings) throw new NotFoundError("The site settings were not found");
  const seoDescriptionOf = (wanted: string): string | null =>
    settings.translations.find((row) => row.locale === wanted)
      ?.seoDescription ?? null;
  // A language with no description of its own serves the default one's, and `locale` says so.
  const ownDescription = seoDescriptionOf(locale);
  return toPublicSiteSettingsDto(settings, {
    seoDescription: ownDescription ?? seoDescriptionOf(defaultLocale),
    locale: ownDescription === null ? defaultLocale : locale,
    timezone,
    serviceTimes,
  });
}
