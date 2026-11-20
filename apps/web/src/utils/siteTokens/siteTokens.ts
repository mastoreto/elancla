import type { SiteConfig } from '@ancla/content';
import type { Locale } from 'src/i18n/config';
import { formatServiceTimeShort } from 'src/utils/formatServiceTimes';

/** Values for the `{placeholders}` of the message files, built from the site configuration. */
export type SiteTokens = Record<string, string>;

/** Last path segment of a social profile URL as an `@handle` ("" when there is none). */
export function handleFromUrl(url: string | undefined): string {
  if (!url) return '';
  const segment = new URL(url).pathname.split('/').filter(Boolean).pop();
  if (!segment) return '';
  return segment.startsWith('@') ? segment : `@${segment}`;
}

function regionName(code: string, locale: Locale): string {
  return new Intl.DisplayNames(locale, { type: 'region' }).of(code) ?? code;
}

/**
 * Tokens that stay out of the result when the church has not set them, so the placeholder shows
 * up in review instead of an empty string.
 */
export function buildSiteTokens(site: SiteConfig, locale: Locale): SiteTokens {
  const worship = site.serviceTimes.find((time) => time.kind === 'worship');
  const bibleSchool = site.serviceTimes.find(
    (time) => time.kind === 'bibleSchool'
  );
  const tokens: Record<string, string | undefined> = {
    name: site.name,
    shortName: site.shortName,
    worshipTime: worship?.start,
    worshipEnd: worship?.end ?? undefined,
    worshipShort: worship && formatServiceTimeShort(worship, locale),
    bibleSchoolTime: bibleSchool?.start,
    street: site.address.street,
    streetShort: site.address.street.split(',')[0]?.trim(),
    city: site.address.city,
    postalCode: site.address.postalCode,
    country: regionName(site.address.country, locale),
    email: site.contactEmail,
    founded: site.founded,
    host: new URL(site.url).host,
    youtubeUrl: site.social.youtube,
    youtubeHandle: handleFromUrl(site.social.youtube),
    instagramHandle: handleFromUrl(site.social.instagram),
    facebookHandle: handleFromUrl(site.social.facebook),
  };
  return Object.fromEntries(
    Object.entries(tokens).filter((entry): entry is [string, string] =>
      Boolean(entry[1])
    )
  );
}
