import type { SiteSettingsDto } from "@ancla/contracts";
import type { SiteSettings, SiteSettingsTranslation } from "@ancla/db";
import { parseServiceTimes, resolveSectionStatuses } from "../../domain";

const STATUSES: Record<SiteSettings["status"], SiteSettingsDto["status"]> = {
  ONLINE: "online",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
};

export interface SiteSettingsOrganization {
  locales: string[];
  defaultLocale: string;
}

/** Explicit field list: the admin view carries the `version` and nothing else internal. */
export function toSiteSettingsDto(
  settings: SiteSettings & { translations: SiteSettingsTranslation[] },
  organization: SiteSettingsOrganization,
): SiteSettingsDto {
  return {
    name: settings.name,
    shortName: settings.shortName,
    subtitle: settings.subtitle,
    url: settings.url,
    status: STATUSES[settings.status],
    contactEmail: settings.contactEmail,
    addressStreet: settings.addressStreet,
    addressCity: settings.addressCity,
    addressRegion: settings.addressRegion,
    addressCountry: settings.addressCountry,
    addressPostal: settings.addressPostal,
    geoLat: settings.geoLat,
    geoLng: settings.geoLng,
    themeColor: settings.themeColor,
    founded: settings.founded,
    website: settings.website,
    instagram: settings.instagram,
    youtube: settings.youtube,
    facebook: settings.facebook,
    twitter: settings.twitter,
    spotify: settings.spotify,
    linkedin: settings.linkedin,
    serviceTimes: parseServiceTimes(settings.serviceTimes),
    sections: resolveSectionStatuses(settings.sectionStatuses),
    translations: Object.fromEntries(
      settings.translations.map((translation) => [
        translation.locale,
        { seoDescription: translation.seoDescription },
      ]),
    ),
    locales: organization.locales,
    defaultLocale: organization.defaultLocale,
    version: settings.version,
  };
}
