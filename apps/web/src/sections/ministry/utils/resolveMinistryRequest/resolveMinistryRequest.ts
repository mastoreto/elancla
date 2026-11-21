import type { PublicMinistry } from '@ancla/content';
import type { Locale } from 'src/i18n/config';
import { localizePath } from 'src/i18n/utils';
import {
  buildSimplePageMeta,
  type SimplePageMeta,
} from 'src/utils/simplePageMeta';

export const MINISTRIES_BASE_PATH = '/ministerios';

export type MinistryRequest =
  | { kind: 'notFound' }
  | { kind: 'redirect'; location: string }
  | { kind: 'page'; ministry: PublicMinistry; meta: SimplePageMeta };

interface Input {
  /** The slug as it came in the URL (already decoded by the router). */
  slug: string;
  /** Language the visitor asked for (the URL prefix). */
  locale: Locale;
  siteUrl: string;
  load: (slug: string, locale: string) => Promise<PublicMinistry | null>;
}

/** Lower case without accents: `Enseñanza` and `ensenanza` are the same ministry. */
export function normalizeMinistrySlug(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

const pathOf = (slug: string, locale: Locale): string =>
  localizePath(`${MINISTRIES_BASE_PATH}/${slug}`, locale);

/**
 * Decides what a ministry URL answers. A slug with accents or capitals is normalized and, when the
 * ministry exists, redirected (301) to its canonical slug in the language asked, so old links such
 * as `/ministerios/enseñanza` keep working. A slug that is not a visible ministry is a 404.
 */
export async function resolveMinistryRequest({
  slug,
  locale,
  siteUrl,
  load,
}: Input): Promise<MinistryRequest> {
  const ministry = await load(normalizeMinistrySlug(slug), locale);
  if (!ministry) return { kind: 'notFound' };
  const canonical = pathOf(ministry.slug, locale);
  if (canonical !== pathOf(slug, locale)) {
    return { kind: 'redirect', location: canonical };
  }
  return {
    kind: 'page',
    ministry,
    meta: buildSimplePageMeta({
      page: ministry,
      locale,
      siteUrl,
      basePath: MINISTRIES_BASE_PATH,
    }),
  };
}
