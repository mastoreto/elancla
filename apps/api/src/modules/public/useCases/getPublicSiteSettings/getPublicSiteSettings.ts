import type { PublicSiteSettingsDto } from "@ancla/contracts";
import { resolveTranslation } from "@ancla/db";
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
  const translation = resolveTranslation(
    settings.translations,
    locale,
    defaultLocale,
  );
  return toPublicSiteSettingsDto(
    settings,
    translation,
    translation?.locale ?? locale,
  );
}
