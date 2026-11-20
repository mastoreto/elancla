import type { PublicSiteSettingsDto, PublicSiteStatus } from "@ancla/contracts";
import type { SiteSettings } from "@ancla/db";
import { parseServiceTimes, resolveSectionStatuses } from "../../../site";

const STATUSES: Record<SiteSettings["status"], PublicSiteStatus> = {
  ONLINE: "online",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
};

function geoOf(settings: SiteSettings): PublicSiteSettingsDto["geo"] {
  if (settings.geoLat === null || settings.geoLng === null) return null;
  return { latitude: settings.geoLat, longitude: settings.geoLng };
}

/** Explicit field list: no ids, `version` or timestamps leave through the public API. */
export function toPublicSiteSettingsDto(
  settings: SiteSettings,
  seoDescription: string | null,
  locale: string,
): PublicSiteSettingsDto {
  return {
    locale,
    name: settings.name,
    shortName: settings.shortName,
    subtitle: settings.subtitle,
    url: settings.url,
    status: STATUSES[settings.status],
    contactEmail: settings.contactEmail,
    address: {
      street: settings.addressStreet,
      city: settings.addressCity,
      region: settings.addressRegion,
      country: settings.addressCountry,
      postalCode: settings.addressPostal,
    },
    geo: geoOf(settings),
    themeColor: settings.themeColor,
    founded: settings.founded,
    serviceTimes: parseServiceTimes(settings.serviceTimes),
    sections: resolveSectionStatuses(settings.sectionStatuses),
    seoDescription,
    social: {
      website: settings.website,
      instagram: settings.instagram,
      youtube: settings.youtube,
      facebook: settings.facebook,
      twitter: settings.twitter,
      spotify: settings.spotify,
      linkedin: settings.linkedin,
    },
  };
}
