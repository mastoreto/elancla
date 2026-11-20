import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_FALLBACK } from '@ancla/content';

// The church's own data (times, address, contact, handles) lives in SiteConfig and reaches the
// pages through `{placeholders}` and props. This test fails when one of those values is typed
// back into the web source.

const SRC_DIR = join(import.meta.dir, '..', '..');
const SCANNED = new Bun.Glob('**/*.{astro,ts,tsx,json}');
const TEST_FILE = /\.test\.ts$/;

function handleOf(url: string | undefined): string[] {
  const segment = url
    ? new URL(url).pathname.split('/').filter(Boolean).pop()
    : '';
  return segment ? [segment.replace(/^@/, '')] : [];
}

const FORBIDDEN_FRAGMENTS: string[] = [
  SITE_FALLBACK.contactEmail,
  SITE_FALLBACK.address.street,
  SITE_FALLBACK.address.postalCode,
  String(SITE_FALLBACK.geo.latitude),
  String(SITE_FALLBACK.geo.longitude),
  new URL(SITE_FALLBACK.url).host,
  ...Object.values(SITE_FALLBACK.social).flatMap(handleOf),
  'Herrera',
  'Arrieta',
  '11:15',
  '11h15',
];

interface AllowedOccurrence {
  /** Path relative to `apps/web/src`. */
  file: string;
  /** One of FORBIDDEN_FRAGMENTS. */
  fragment: string;
  reason: string;
}

// Narrow on purpose: data that belongs to another phase, or fixed narrative (D-39). Everything
// else is cleaned up, not allowed here. Each phase removes its own entries.
const ALLOWLIST: AllowedOccurrence[] = [
  {
    file: 'utils/ministriesData.json',
    fragment: 'elancla.uy',
    reason: '1.5: ministry data (the women ministry has its own subdomain)',
  },
  {
    file: 'i18n/messages/es/ministries.json',
    fragment: 'elancla.uy',
    reason: '1.5: ministry data (the women ministry has its own subdomain)',
  },
  {
    file: 'i18n/messages/en/ministries.json',
    fragment: 'elancla.uy',
    reason: '1.5: ministry data (the women ministry has its own subdomain)',
  },
  {
    file: 'i18n/messages/pt/ministries.json',
    fragment: 'elancla.uy',
    reason: '1.5: ministry data (the women ministry has its own subdomain)',
  },
  {
    file: 'sections/landing/Together/Together.astro',
    fragment: 'elancla.uy',
    reason:
      '1.5: link to the women ministry site, which comes with the ministry data',
  },
  {
    file: 'data/calendar.ts',
    fragment: '11:15',
    reason:
      '1.6: sample calendar events; the calendar phase replaces them with activities',
  },
];

function findOccurrences(): { file: string; fragment: string }[] {
  const found: { file: string; fragment: string }[] = [];
  for (const file of SCANNED.scanSync({ cwd: SRC_DIR })) {
    if (TEST_FILE.test(file)) continue;
    const content = readFileSync(join(SRC_DIR, file), 'utf8').toLowerCase();
    for (const fragment of FORBIDDEN_FRAGMENTS) {
      if (content.includes(fragment.toLowerCase()))
        found.push({ file, fragment });
    }
  }
  return found;
}

const isAllowed = (occurrence: { file: string; fragment: string }): boolean =>
  ALLOWLIST.some(
    (entry) =>
      entry.file === occurrence.file && entry.fragment === occurrence.fragment
  );

describe('no hardcoded church data in apps/web/src', () => {
  const occurrences = findOccurrences();

  test('the church data comes from SiteConfig, not from the source', () => {
    const forbidden = occurrences
      .filter((occurrence) => !isAllowed(occurrence))
      .map(({ file, fragment }) => `${file}: "${fragment}"`);
    expect(forbidden).toEqual([]);
  });

  test('every allowlist entry is still needed and explains itself', () => {
    const unused = ALLOWLIST.filter(
      (entry) =>
        !occurrences.some(
          (occurrence) =>
            occurrence.file === entry.file &&
            occurrence.fragment === entry.fragment
        )
    ).map((entry) => `${entry.file}: "${entry.fragment}"`);
    expect(unused).toEqual([]);
    for (const entry of ALLOWLIST) {
      expect(FORBIDDEN_FRAGMENTS).toContain(entry.fragment);
      expect(entry.reason.length).toBeGreaterThan(0);
    }
  });
});
