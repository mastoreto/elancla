// getBlogIndex(locale), getPost(slug, locale) and recordPostView(slug, visitor): the blog from the
// public API. The reads have the same contract as getPages / getPage: cached for a minute, last
// known good when the API fails; the index is empty before the first success and a post falls back
// to `null` (the web answers 404). A real 404 is a successful answer, so it is cached as `null`.
// The view is not read: no cache, fire-and-forget.

import type {
  PublicBlogCoverDto,
  PublicBlogIndexDto,
  PublicPostAuthorDto,
  PublicPostDto,
  PublicPostSummaryDto,
  PublicSeriesDto,
  RecordPostViewBody,
} from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import { createPublicClientFromEnv, readCacheTtlMs } from "../site";

export type PublicBlogIndex = PublicBlogIndexDto;
export type PublicPost = PublicPostDto;
export type PublicPostSummary = PublicPostSummaryDto;
export type PublicBlogCover = PublicBlogCoverDto;
export type PublicPostAuthor = PublicPostAuthorDto;
export type PublicSeries = PublicSeriesDto;

const CACHE_TTL_MS = 60_000;
// A slug is kebab-case and a locale a short code, so neither contains this character.
const KEY_SEPARATOR = ":";

export interface BlogLoaderOptions {
  /** `null` when the site is not configured for the API: an empty index / `null` is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type BlogIndexLoader = (locale: string) => Promise<PublicBlogIndex>;
export type PostLoader = (
  slug: string,
  locale: string,
) => Promise<PublicPost | null>;
export type PostViewRecorder = (
  slug: string,
  visitor: RecordPostViewBody,
) => Promise<void>;

function emptyIndex(locale: string): PublicBlogIndex {
  return {
    locale,
    posts: [],
    featured: null,
    categories: [],
    series: [],
    archive: [],
    popular: [],
    tags: [],
  };
}

export function createBlogIndexLoader(
  options: BlogLoaderOptions,
): BlogIndexLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicBlogIndex>({
    load: (locale) => (client as PublicClient).getPosts(locale),
    fallback: emptyIndex,
    ttlMs,
    now,
    warn,
  });
  return function getBlogIndex(locale) {
    if (!client) return Promise.resolve(emptyIndex(locale));
    return get(locale);
  };
}

export function createPostLoader(options: BlogLoaderOptions): PostLoader {
  const { client, now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicPost | null>({
    load: (key) => {
      const separator = key.lastIndexOf(KEY_SEPARATOR);
      return (client as PublicClient).getPost(
        key.slice(0, separator),
        key.slice(separator + 1),
      );
    },
    // ponytail: a post 404s if the API is down before the first success
    fallback: () => null,
    ttlMs,
    now,
    warn,
  });
  return function getPost(slug, locale) {
    if (!client) return Promise.resolve(null);
    return get(`${slug}${KEY_SEPARATOR}${locale}`);
  };
}

/** Never rejects: a lost view is not worth failing the beacon over. */
export function createPostViewRecorder(
  options: Pick<BlogLoaderOptions, "client" | "warn">,
): PostViewRecorder {
  const { client, warn = (message, error) => console.warn(message, error) } =
    options;
  return async function recordPostView(slug, visitor) {
    if (!client) return;
    try {
      await client.recordPostView(slug, visitor);
    } catch (error) {
      warn("[@ancla/content] could not record the post view", error);
    }
  };
}

let defaultIndexLoader: BlogIndexLoader | null = null;
let defaultPostLoader: PostLoader | null = null;
let defaultViewRecorder: PostViewRecorder | null = null;

function defaultOptions(): BlogLoaderOptions {
  return {
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  };
}

/**
 * The blog index in `locale`: visible posts, featured, categories, series, archive, most read and
 * tags. Server side only. Never throws: an empty index when the API is down or unconfigured.
 */
export function getBlogIndex(locale: string): Promise<PublicBlogIndex> {
  // ponytail: builds its own env client, like getPages.
  defaultIndexLoader ??= createBlogIndexLoader(defaultOptions());
  return defaultIndexLoader(locale);
}

/**
 * A visible post by `slug` (the slug of any of its languages), in `locale`. Server side only.
 * Never throws: `null` when it does not exist, is scheduled or paused, or the API is down or
 * unconfigured.
 */
export function getPost(
  slug: string,
  locale: string,
): Promise<PublicPost | null> {
  defaultPostLoader ??= createPostLoader(defaultOptions());
  return defaultPostLoader(slug, locale);
}

/**
 * Counts an anonymous view of a post. `visitor` is the real address and user agent of the reader
 * (the API only hashes them). Server side only. Never throws.
 */
export function recordPostView(
  slug: string,
  visitor: RecordPostViewBody,
): Promise<void> {
  defaultViewRecorder ??= createPostViewRecorder({
    client: createPublicClientFromEnv(process.env),
  });
  return defaultViewRecorder(slug, visitor);
}
