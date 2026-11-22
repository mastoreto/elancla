import { z } from "zod";
import { serviceTimeDto, siteSectionsDto } from "../site";

export const PUBLIC_SITE_STATUSES = [
  "online",
  "maintenance",
  "closed",
] as const;

/** BCP 47 subset the public API accepts in `?locale=` (`es`, `pt`, `es-UY`). */
export const PUBLIC_LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

export const publicLocaleQuery = z.object({
  locale: z.string().regex(PUBLIC_LOCALE_PATTERN).optional(),
});

/**
 * Site settings as the public site reads them. Deliberately no ids, `version` or timestamps:
 * this contract is public and versioned (`/public/v1`).
 */
export const publicSiteSettingsDto = z.strictObject({
  /** The language actually served (the default one when the requested one is not enabled). */
  locale: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  subtitle: z.string().nullable(),
  url: z.string(),
  status: z.enum(PUBLIC_SITE_STATUSES),
  contactEmail: z.string().nullable(),
  address: z.strictObject({
    street: z.string().nullable(),
    city: z.string().nullable(),
    region: z.string().nullable(),
    country: z.string().nullable(),
    postalCode: z.string().nullable(),
  }),
  geo: z
    .strictObject({ latitude: z.number(), longitude: z.number() })
    .nullable(),
  themeColor: z.string().nullable(),
  founded: z.string().nullable(),
  /** IANA time zone of the church (`America/Montevideo`): every hour of the site is in it. */
  timezone: z.string(),
  /** This week's worship times, derived from the calendar (the schedule set in force today). */
  serviceTimes: z.array(serviceTimeDto),
  /** Every section key is always present; a section never configured is `active`. */
  sections: siteSectionsDto,
  /** Default meta description, resolved by locale (null when none was written). */
  seoDescription: z.string().nullable(),
  social: z.strictObject({
    website: z.string().nullable(),
    instagram: z.string().nullable(),
    youtube: z.string().nullable(),
    facebook: z.string().nullable(),
    twitter: z.string().nullable(),
    spotify: z.string().nullable(),
    linkedin: z.string().nullable(),
  }),
});

export type PublicSiteStatus = (typeof PUBLIC_SITE_STATUSES)[number];
export type PublicSiteSettingsDto = z.infer<typeof publicSiteSettingsDto>;
