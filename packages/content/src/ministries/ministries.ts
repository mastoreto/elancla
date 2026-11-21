// getMinistries(locale) and getMinistry(slug, locale): the ministries from the public API. Same
// contract as getPages / getPage: cached for a minute, last known good when the API fails; the
// list is empty before the first success and a ministry falls back to `null` (the web answers
// 404). A real 404 is a successful answer, so it is cached as `null`.

import type {
  PublicLandingEntryDto,
  PublicMinistriesDto,
  PublicMinistryDto,
  PublicMinistryLeaderDto,
  PublicMinistrySummaryDto,
} from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import { createPublicClientFromEnv, readCacheTtlMs } from "../site";

export type PublicMinistries = PublicMinistriesDto;
export type PublicMinistry = PublicMinistryDto;
export type PublicMinistrySummary = PublicMinistrySummaryDto;
export type PublicMinistryLeader = PublicMinistryLeaderDto;
export type PublicLandingEntry = PublicLandingEntryDto;

const CACHE_TTL_MS = 60_000;
// A slug is kebab-case and a locale a short code, so neither contains this character.
const KEY_SEPARATOR = ":";

export interface MinistriesLoaderOptions {
  /** `null` when the site is not configured for the API: an empty list / `null` is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type MinistriesLoader = (locale: string) => Promise<PublicMinistries>;
export type MinistryLoader = (
  slug: string,
  locale: string,
) => Promise<PublicMinistry | null>;

function emptyMinistries(): PublicMinistries {
  return { ministries: [], landing: [] };
}

export function createMinistriesLoader(
  options: MinistriesLoaderOptions,
): MinistriesLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicMinistries>({
    load: (locale) => (client as PublicClient).getMinistries(locale),
    fallback: emptyMinistries,
    ttlMs,
    now,
    warn,
  });
  return function getMinistries(locale) {
    if (!client) return Promise.resolve(emptyMinistries());
    return get(locale);
  };
}

export function createMinistryLoader(
  options: MinistriesLoaderOptions,
): MinistryLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicMinistry | null>({
    load: (key) => {
      const separator = key.lastIndexOf(KEY_SEPARATOR);
      return (client as PublicClient).getMinistry(
        key.slice(0, separator),
        key.slice(separator + 1),
      );
    },
    // ponytail: a ministry 404s if the API is down before the first success
    fallback: () => null,
    ttlMs,
    now,
    warn,
  });
  return function getMinistry(slug, locale) {
    if (!client) return Promise.resolve(null);
    return get(`${slug}${KEY_SEPARATOR}${locale}`);
  };
}

let defaultListLoader: MinistriesLoader | null = null;
let defaultDetailLoader: MinistryLoader | null = null;

function defaultOptions(): MinistriesLoaderOptions {
  return {
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  };
}

/**
 * The visible ministries and the ordered landing mosaic in `locale`. Server side only. Never
 * throws: both lists empty when the API is down or unconfigured.
 */
export function getMinistries(locale: string): Promise<PublicMinistries> {
  defaultListLoader ??= createMinistriesLoader(defaultOptions());
  return defaultListLoader(locale);
}

/**
 * A visible ministry by `slug` (the slug of any of its languages), in `locale`. Server side only.
 * Never throws: `null` when it does not exist, is paused, or the API is down or unconfigured.
 */
export function getMinistry(
  slug: string,
  locale: string,
): Promise<PublicMinistry | null> {
  defaultDetailLoader ??= createMinistryLoader(defaultOptions());
  return defaultDetailLoader(slug, locale);
}
