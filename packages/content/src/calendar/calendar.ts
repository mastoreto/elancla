// getCalendar(locale, year?): the public calendar from the public API. Same contract as
// getMinistries: cached for a minute per (locale, year), last known good when the API fails, and
// before the first success an empty, unpublished calendar (the web then shows no events).

import type { PublicCalendarDto } from "@ancla/contracts";
import { createCachedLoader } from "../cachedLoader";
import type { PublicClient } from "../publicClient";
import {
  createPublicClientFromEnv,
  readCacheTtlMs,
  SITE_FALLBACK,
} from "../site";

export type PublicCalendar = PublicCalendarDto;

const CACHE_TTL_MS = 60_000;
// A locale is a short code and a year digits, so neither contains this character.
const KEY_SEPARATOR = ":";
const CURRENT_YEAR_KEY = "";

export interface CalendarLoaderOptions {
  /** `null` when the site is not configured for the API: the empty calendar is served, no network. */
  client: PublicClient | null;
  now?: () => number;
  ttlMs?: number;
  warn?: (message: string, error: unknown) => void;
}

export type CalendarLoader = (
  locale: string,
  year?: number,
) => Promise<PublicCalendar>;

function yearInZone(timezone: string, at: number): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
    }).format(at),
  );
}

function emptyCalendar(year: number | undefined, at: number): PublicCalendar {
  const { timezone } = SITE_FALLBACK;
  return {
    year: year ?? yearInZone(timezone, at),
    published: false,
    timezone,
    ministries: [],
    weekly: [],
    exceptions: [],
    events: [],
  };
}

function parseKey(key: string): { locale: string; year: number | undefined } {
  const separator = key.lastIndexOf(KEY_SEPARATOR);
  const rawYear = key.slice(separator + 1);
  return {
    locale: key.slice(0, separator),
    year: rawYear === CURRENT_YEAR_KEY ? undefined : Number(rawYear),
  };
}

export function createCalendarLoader(
  options: CalendarLoaderOptions,
): CalendarLoader {
  const { client, now = Date.now, ttlMs = CACHE_TTL_MS, warn } = options;
  const get = createCachedLoader<PublicCalendar>({
    load: (key) => {
      const { locale, year } = parseKey(key);
      return (client as PublicClient).getCalendar(locale, year);
    },
    fallback: (key) => emptyCalendar(parseKey(key).year, now()),
    ttlMs,
    now,
    warn,
  });
  return function getCalendar(locale, year) {
    if (!client) return Promise.resolve(emptyCalendar(year, now()));
    return get(`${locale}${KEY_SEPARATOR}${year ?? CURRENT_YEAR_KEY}`);
  };
}

let defaultLoader: CalendarLoader | null = null;

/**
 * The calendar of `year` (the current one in the church time zone when omitted) in `locale`.
 * Server side only. Never throws: an empty, unpublished calendar when the API is down or unconfigured.
 */
export function getCalendar(
  locale: string,
  year?: number,
): Promise<PublicCalendar> {
  defaultLoader ??= createCalendarLoader({
    client: createPublicClientFromEnv(process.env),
    ttlMs: readCacheTtlMs(process.env),
  });
  return defaultLoader(locale, year);
}
