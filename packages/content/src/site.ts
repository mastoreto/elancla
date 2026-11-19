// @ancla/content/site — site configuration for the public site.
// getSiteConfig() reads the public API (`/api/public/v1/:churchSlug/settings`) with a site key and
// keeps it in memory for a minute. If the API is down it serves the last good value, and before
// the first success SITE_FALLBACK (the historical values of seo.ts): the site never goes down
// with the API. iEkklesia (admin) writes; the web only reads.

import type { PublicSiteSettingsDto } from "@ancla/contracts";
import { createPublicClient, type PublicClient } from "./publicClient";

export type SiteLocale = "es" | "pt" | "en";
export type SiteStatus = "online" | "maintenance" | "closed";

export interface SiteSocial {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
  website?: string;
}

export interface SiteConfig {
  url: string;
  name: string;
  shortName: string;
  locale: string;
  lang: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultImage: string;
  themeColor: string;
  twitter: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  geo: { latitude: number; longitude: number };
  contactEmail: string;
  founded: string;
  serviceTimes: string;
  /** Google Business / Maps profile URL; when absent the schema uses a coordinates link. */
  mapUrl?: string;
  status: SiteStatus;
  social: SiteSocial;
}

// Valores por defecto (copia de los valores históricos de apps/web/src/utils/seo.ts).
export const SITE_FALLBACK: SiteConfig = {
  url: "https://elancla.uy",
  name: "Iglesia Bautista El Ancla",
  shortName: "El Ancla",
  locale: "es_UY",
  lang: "es-UY",
  defaultTitle: "Iglesia Bautista El Ancla",
  titleTemplate: "%s | Iglesia Bautista El Ancla",
  defaultDescription:
    "Iglesia Bautista El Ancla en Montevideo: una comunidad cristiana centrada en el evangelio. Reflexiones, ministerios y vida en comunidad. Domingos 11:15 hs.",
  defaultImage: "/images/og-default.jpg",
  themeColor: "#ff2e34",
  twitter: "@iglesiaelancla",
  address: {
    street: "Av. Luis A. de Herrera 3101, esq. Juan Arrieta",
    city: "Montevideo",
    region: "Montevideo",
    country: "UY",
    postalCode: "11600",
  },
  geo: { latitude: -34.872968, longitude: -56.161429 },
  contactEmail: "contacto@elancla.uy",
  founded: "1997",
  serviceTimes: "Su 11:15-13:00",
  status: "online",
  social: {
    youtube: "https://youtube.com/@iglesiaelanclauy",
    instagram: "https://www.instagram.com/iglesiaelancla",
    facebook: "https://www.facebook.com/iglesiabautistaelancla",
  },
};

const CACHE_TTL_MS = 60_000;

/** Fields the API does not send (null) keep the fallback value. */
export function toSiteConfig(settings: PublicSiteSettingsDto): SiteConfig {
  const { address, geo, social } = settings;
  return {
    ...SITE_FALLBACK,
    url: settings.url || SITE_FALLBACK.url,
    name: settings.name || SITE_FALLBACK.name,
    shortName: settings.shortName ?? SITE_FALLBACK.shortName,
    themeColor: settings.themeColor ?? SITE_FALLBACK.themeColor,
    contactEmail: settings.contactEmail ?? SITE_FALLBACK.contactEmail,
    founded: settings.founded ?? SITE_FALLBACK.founded,
    serviceTimes: settings.serviceTimesSummary ?? SITE_FALLBACK.serviceTimes,
    status: settings.status,
    address: {
      street: address.street ?? SITE_FALLBACK.address.street,
      city: address.city ?? SITE_FALLBACK.address.city,
      region: address.region ?? SITE_FALLBACK.address.region,
      country: address.country ?? SITE_FALLBACK.address.country,
      postalCode: address.postalCode ?? SITE_FALLBACK.address.postalCode,
    },
    geo: geo ?? SITE_FALLBACK.geo,
    social: {
      youtube: social.youtube ?? SITE_FALLBACK.social.youtube,
      instagram: social.instagram ?? SITE_FALLBACK.social.instagram,
      facebook: social.facebook ?? SITE_FALLBACK.social.facebook,
      twitter: social.twitter ?? SITE_FALLBACK.social.twitter,
      spotify: social.spotify ?? SITE_FALLBACK.social.spotify,
      linkedin: social.linkedin ?? SITE_FALLBACK.social.linkedin,
      website: social.website ?? SITE_FALLBACK.social.website,
    },
  };
}

export interface SiteConfigLoaderOptions {
  /** `null` when the site is not configured for the API: the fallback is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

/**
 * Builds the cached reader behind `getSiteConfig`. One attempt per TTL window (success or failure,
 * so an API that is down is not hit, and waited on, by every request) and one in flight at a time.
 */
export function createSiteConfigLoader(
  options: SiteConfigLoaderOptions,
): () => Promise<SiteConfig> {
  const {
    client,
    now = Date.now,
    ttlMs = CACHE_TTL_MS,
    warn = (message, error) => console.warn(message, error),
  } = options;
  let lastGood: SiteConfig | null = null;
  let nextAttemptAt = 0;
  let inFlight: Promise<SiteConfig> | null = null;

  async function refresh(publicClient: PublicClient): Promise<SiteConfig> {
    try {
      lastGood = toSiteConfig(await publicClient.getSettings());
    } catch (error) {
      // Once per window, because the window is also the retry interval.
      warn(
        "[@ancla/content] public API unavailable, serving the last known site config",
        error,
      );
    }
    nextAttemptAt = now() + ttlMs;
    return lastGood ?? SITE_FALLBACK;
  }

  return async function getSiteConfig(): Promise<SiteConfig> {
    if (!client) return SITE_FALLBACK;
    if (now() < nextAttemptAt) return lastGood ?? SITE_FALLBACK;
    inFlight ??= refresh(client).finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

export const SITE_ENV_VARS = [
  "API_URL",
  "SITE_API_KEY",
  "SITE_CHURCH_SLUG",
] as const;

export const SITE_KEY_SETUP_COMMAND =
  'bun run --filter @ancla/api site-key:create -- --name "web local" --write-env';

/**
 * `null` unless the three variables are set: a site without them just uses the fallback. The
 * fallback is silent from the visitor's side, so `warn` names what is missing and how to fix it
 * (otherwise a status change made in iEkklesia seems to "do nothing").
 */
export function createPublicClientFromEnv(
  env: Readonly<Record<string, string | undefined>>,
  warn: (message: string) => void = (message) => console.warn(message),
): PublicClient | null {
  const missing = SITE_ENV_VARS.filter((name) => !env[name]);
  if (missing.length > 0) {
    warn(
      `[@ancla/content] ${missing.join(", ")} not set: the site serves its built-in defaults and ` +
        `ignores iEkklesia (status, contact, hours). Create a key with: ${SITE_KEY_SETUP_COMMAND}`,
    );
    return null;
  }
  return createPublicClient({
    baseUrl: env.API_URL as string,
    apiKey: env.SITE_API_KEY as string,
    churchSlug: env.SITE_CHURCH_SLUG as string,
  });
}

/** `SITE_CONFIG_TTL_MS` (positive integer) shortens the cache, e.g. for E2E; invalid means default. */
export function readCacheTtlMs(
  env: Readonly<Record<string, string | undefined>>,
): number {
  const parsed = Number(env.SITE_CONFIG_TTL_MS);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : CACHE_TTL_MS;
}

let defaultLoader: (() => Promise<SiteConfig>) | null = null;

/**
 * Site configuration merged over SITE_FALLBACK. Fields the API does not provide (lang, title
 * templates, twitter handle, default image) keep the default value. Server side only: it reads
 * `API_URL`, `SITE_API_KEY` and `SITE_CHURCH_SLUG` (and optionally `SITE_CONFIG_TTL_MS`) from
 * the environment; when the first three are missing it warns once per process.
 */
export function getSiteConfig(): Promise<SiteConfig> {
  defaultLoader ??= createSiteConfigLoader({
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  });
  return defaultLoader();
}
