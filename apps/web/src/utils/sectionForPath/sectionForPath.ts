import type { SiteSectionKey } from '@ancla/content';
import { stripLocaleFromPath } from 'src/i18n/utils';

const SECTION_ROOTS: Record<SiteSectionKey, string> = {
  blog: '/blog',
  calendar: '/calendario-anual',
  sermons: '/sermones',
  ministries: '/ministerios',
  visit: '/visitanos',
};

// The calendar also serves its feed at `/calendario-anual.ics`.
const SECTION_EXTENSIONS = ['.ics'];

/** The site section a URL path belongs to (locale prefix ignored), or null for the rest. */
export function sectionForPath(path: string): SiteSectionKey | null {
  const { pathname } = new URL(stripLocaleFromPath(path), 'http://site.local');
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  for (const [key, root] of Object.entries(SECTION_ROOTS)) {
    const matches =
      trimmed === root ||
      trimmed.startsWith(`${root}/`) ||
      SECTION_EXTENSIONS.some((extension) => trimmed === `${root}${extension}`);
    if (matches) return key as SiteSectionKey;
  }
  return null;
}
