// getPages(locale) and getPage(slug, locale) — the simple pages (privacy policy...).
// Same contract as getPeople for the list: cached for a minute, last known good when the API
// fails, `[]` before the first success. A page by slug falls back to `null` (the web answers 404);
// a real 404 from the API is a successful answer, so it is cached as `null` for the window.

import type { PublicPageDto, PublicPageSummaryDto } from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import { createPublicClientFromEnv, readCacheTtlMs } from "../site";

export type PublicPage = PublicPageDto;
export type PublicPageSummary = PublicPageSummaryDto;

const CACHE_TTL_MS = 60_000;
// A slug is kebab-case and a locale a short code, so neither contains this character.
const KEY_SEPARATOR = ":";

export interface PagesLoaderOptions {
  /** `null` when the site is not configured for the API: `[]` / `null` are served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type PagesLoader = (locale: string) => Promise<PublicPageSummary[]>;
export type PageLoader = (
  slug: string,
  locale: string,
) => Promise<PublicPage | null>;

export function createPagesLoader(options: PagesLoaderOptions): PagesLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicPageSummary[]>({
    load: (locale) => (client as PublicClient).getPages(locale),
    fallback: () => [],
    ttlMs,
    now,
    warn,
  });
  return function getPages(locale) {
    if (!client) return Promise.resolve([]);
    return get(locale);
  };
}

export function createPageLoader(options: PagesLoaderOptions): PageLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicPage | null>({
    load: (key) => {
      const separator = key.lastIndexOf(KEY_SEPARATOR);
      return (client as PublicClient).getPage(
        key.slice(0, separator),
        key.slice(separator + 1),
      );
    },
    // ponytail: a simple page 404s if the API is down before the first success
    fallback: () => null,
    ttlMs,
    now,
    warn,
  });
  return function getPage(slug, locale) {
    if (!client) return Promise.resolve(null);
    return get(`${slug}${KEY_SEPARATOR}${locale}`);
  };
}

let defaultPagesLoader: PagesLoader | null = null;
let defaultPageLoader: PageLoader | null = null;

function defaultOptions(): PagesLoaderOptions {
  return {
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  };
}

/**
 * Titles and slugs of the published pages in `locale`. Server side only. Never throws: `[]`
 * when the API is down or unconfigured.
 */
export function getPages(locale: string): Promise<PublicPageSummary[]> {
  // ponytail: builds its own env client, like getPeople.
  defaultPagesLoader ??= createPagesLoader(defaultOptions());
  return defaultPagesLoader(locale);
}

/**
 * A published page by `slug` (the slug of any of its languages), rendered in `locale`. Server
 * side only. Never throws: `null` when it does not exist, is paused, or the API is down or
 * unconfigured.
 */
export function getPage(
  slug: string,
  locale: string,
): Promise<PublicPage | null> {
  defaultPageLoader ??= createPageLoader(defaultOptions());
  return defaultPageLoader(slug, locale);
}
