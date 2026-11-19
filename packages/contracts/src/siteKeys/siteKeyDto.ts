import { z } from "zod";

const SITE_KEY_NAME_MAX_LENGTH = 60;

/** A site key as the admin list shows it. The secret and its hash never leave the API. */
export const siteKeyDto = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  /** `sk_` plus the first characters of the id: enough to recognize a key, useless to use it. */
  hint: z.string(),
  createdAt: z.iso.datetime(),
  revokedAt: z.iso.datetime().nullable(),
});

export const createSiteKeyBody = z.strictObject({
  name: z.string().trim().min(1).max(SITE_KEY_NAME_MAX_LENGTH),
});

/** The only response that carries the full key; it is shown once and cannot be recovered. */
export const createdSiteKeyDto = siteKeyDto.extend({ key: z.string() });

export type SiteKeyDto = z.infer<typeof siteKeyDto>;
export type CreateSiteKeyBody = z.infer<typeof createSiteKeyBody>;
export type CreatedSiteKeyDto = z.infer<typeof createdSiteKeyDto>;
