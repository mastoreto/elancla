// getVisit(locale) — directions and editable FAQ of the visit page.
// Same contract as getPeople: cached for a minute per locale, last known good when the API fails,
// and before the first success an empty visit, so the page renders only its own copy.

import type { PublicVisitDto } from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import { createPublicClientFromEnv, readCacheTtlMs } from "../site";

export type VisitContent = PublicVisitDto;

const CACHE_TTL_MS = 60_000;

export interface VisitLoaderOptions {
  /** `null` when the site is not configured for the API: the empty visit is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type VisitLoader = (locale: string) => Promise<VisitContent>;

function emptyVisit(): VisitContent {
  return {
    directions: { parking: null, transit: null, accessibility: null },
    faqs: [],
  };
}

export function createVisitLoader(options: VisitLoaderOptions): VisitLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<VisitContent>({
    load: (locale) => (client as PublicClient).getVisit(locale),
    fallback: emptyVisit,
    ttlMs,
    now,
    warn,
  });
  return function getVisit(locale) {
    if (!client) return Promise.resolve(emptyVisit());
    return get(locale);
  };
}

let defaultLoader: VisitLoader | null = null;

/**
 * Visit page content in `locale`. Server side only (reads `API_URL`, `SITE_API_KEY`,
 * `SITE_CHURCH_SLUG`). Never throws: the empty visit when the API is down or unconfigured.
 */
export function getVisit(locale: string): Promise<VisitContent> {
  // ponytail: builds its own env client, like getPeople.
  defaultLoader ??= createVisitLoader({
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  });
  return defaultLoader(locale);
}
