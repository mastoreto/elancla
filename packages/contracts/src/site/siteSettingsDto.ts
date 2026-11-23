import { z } from "zod";

/** Sections of the public site an admin can put in maintenance or take out of service (D-33). */
export const SITE_SECTION_KEYS = [
  "blog",
  "calendar",
  "sermons",
  "ministries",
  "visit",
] as const;
export type SiteSectionKey = (typeof SITE_SECTION_KEYS)[number];

export const SITE_SECTION_STATUSES = [
  "active",
  "maintenance",
  "outOfService",
] as const;
export const siteSectionStatus = z.enum(SITE_SECTION_STATUSES);
export type SiteSectionStatus = z.infer<typeof siteSectionStatus>;

export const SERVICE_TIME_KINDS = ["worship", "bibleSchool"] as const;
export const SEO_DESCRIPTION_MAX_LENGTH = 160;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeOfDay = z.string().regex(TIME_PATTERN);

/** One weekly slot. `weekday` follows `Date#getDay` (0 = Sunday). `HH:mm` compares as text. */
export const serviceTimeDto = z
  .strictObject({
    kind: z.enum(SERVICE_TIME_KINDS),
    weekday: z.number().int().min(0).max(6),
    start: timeOfDay,
    end: timeOfDay.nullable(),
  })
  .refine((slot) => slot.end === null || slot.end > slot.start, {
    path: ["end"],
    message: "end must be after start",
  });
export type ServiceTimeDto = z.infer<typeof serviceTimeDto>;

export const siteSectionsDto = z.strictObject(
  Object.fromEntries(
    SITE_SECTION_KEYS.map((key) => [key, siteSectionStatus]),
  ) as Record<SiteSectionKey, typeof siteSectionStatus>,
);

const SHORT_TEXT_MAX_LENGTH = 120;
const URL_MAX_LENGTH = 300;
const optionalText = (max: number = SHORT_TEXT_MAX_LENGTH) =>
  z.string().trim().max(max).nullable();
// A social link ends up in an href: only web schemes.
const httpUrl = z.url({ protocol: /^https?$/ }).max(URL_MAX_LENGTH);
/** `UC` followed by 22 URL-safe characters: what the YouTube API calls a channel id. */
export const YOUTUBE_CHANNEL_ID_PATTERN = /^UC[\w-]{22}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const seoTranslationDto = z.strictObject({
  seoDescription: z.string().trim().max(SEO_DESCRIPTION_MAX_LENGTH).nullable(),
});

/** Site settings as the CRM edits them (admin view: it carries the `version` for the lock). */
export const siteSettingsDto = z.strictObject({
  name: z.string(),
  shortName: z.string().nullable(),
  subtitle: z.string().nullable(),
  url: z.string(),
  status: z.enum(["online", "maintenance", "closed"]),
  contactEmail: z.string().nullable(),
  addressStreet: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressRegion: z.string().nullable(),
  addressCountry: z.string().nullable(),
  addressPostal: z.string().nullable(),
  geoLat: z.number().nullable(),
  geoLng: z.number().nullable(),
  themeColor: z.string().nullable(),
  founded: z.string().nullable(),
  website: z.string().nullable(),
  instagram: z.string().nullable(),
  youtube: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  spotify: z.string().nullable(),
  linkedin: z.string().nullable(),
  /** YouTube channel the sermon suggestions and the live status read from (`UC…`). */
  youtubeChannelId: z.string().nullable(),
  /** Complete map: keys never configured come back as `active`. */
  sections: siteSectionsDto,
  translations: z.record(z.string(), seoTranslationDto),
  locales: z.array(z.string()),
  defaultLocale: z.string(),
  version: z.number().int(),
});
export type SiteSettingsDto = z.infer<typeof siteSettingsDto>;

const editableFields = z.strictObject({
  name: z.string().trim().min(1).max(SHORT_TEXT_MAX_LENGTH),
  shortName: optionalText(),
  subtitle: optionalText(200),
  url: httpUrl,
  status: z.enum(["online", "maintenance", "closed"]),
  contactEmail: z.email().max(URL_MAX_LENGTH).nullable(),
  addressStreet: optionalText(),
  addressCity: optionalText(),
  addressRegion: optionalText(),
  addressCountry: optionalText(),
  addressPostal: optionalText(40),
  geoLat: z.number().min(-90).max(90).nullable(),
  geoLng: z.number().min(-180).max(180).nullable(),
  themeColor: z.string().regex(HEX_COLOR_PATTERN).nullable(),
  founded: z
    .string()
    .trim()
    .regex(/^\d{4}$/)
    .nullable(),
  website: httpUrl.nullable(),
  instagram: httpUrl.nullable(),
  youtube: httpUrl.nullable(),
  facebook: httpUrl.nullable(),
  twitter: httpUrl.nullable(),
  spotify: httpUrl.nullable(),
  linkedin: httpUrl.nullable(),
  youtubeChannelId: z.string().regex(YOUTUBE_CHANNEL_ID_PATTERN).nullable(),
  /** Replaces the whole map; a key left out falls back to `active`. */
  sections: siteSectionsDto.partial(),
  /** Replaces only the locales sent; locales the organization does not use are rejected (400). */
  translations: z.record(z.string(), seoTranslationDto),
});

/** PATCH body: any subset of the settings, plus the `version` the editor loaded (optimistic lock). */
export const updateSiteSettingsBody = editableFields.partial().extend({
  version: z.number().int().min(0),
});
export type UpdateSiteSettingsBody = z.infer<typeof updateSiteSettingsBody>;
