// getPeople(context, locale) — public profiles shown in one context (team, blog authors...).
// Same contract as getSiteConfig: cached for a minute, last known good when the API fails, and
// before the first success an empty list, so a page that renders people simply omits them.

import type { PersonContext, PublicPersonDto } from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import { createPublicClientFromEnv, readCacheTtlMs } from "../site";

export type PublicPerson = PublicPersonDto;

const CACHE_TTL_MS = 60_000;
const KEY_SEPARATOR = ":";

export interface PeopleLoaderOptions {
  /** `null` when the site is not configured for the API: `[]` is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type PeopleLoader = (
  context: PersonContext,
  locale: string,
) => Promise<PublicPerson[]>;

export function createPeopleLoader(options: PeopleLoaderOptions): PeopleLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicPerson[]>({
    load: (key) => {
      const [context, locale] = key.split(KEY_SEPARATOR) as [
        PersonContext,
        string,
      ];
      return (client as PublicClient).getPeople(context, locale);
    },
    fallback: () => [],
    ttlMs,
    now,
    warn,
  });
  return function getPeople(context, locale) {
    if (!client) return Promise.resolve([]);
    return get(`${context}${KEY_SEPARATOR}${locale}`);
  };
}

let defaultLoader: PeopleLoader | null = null;

/**
 * People visible in `context`, ordered by the API. Server side only (reads `API_URL`,
 * `SITE_API_KEY`, `SITE_CHURCH_SLUG`). Never throws: `[]` when the API is down or unconfigured.
 */
export function getPeople(
  context: PersonContext,
  locale: string,
): Promise<PublicPerson[]> {
  // ponytail: builds its own env client, so a missing env warns once here and once in getSiteConfig.
  defaultLoader ??= createPeopleLoader({
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  });
  return defaultLoader(context, locale);
}
