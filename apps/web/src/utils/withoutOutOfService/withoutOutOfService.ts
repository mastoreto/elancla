import type { SiteConfig } from '@ancla/content';
import { sectionForPath } from 'src/utils/sectionForPath';

/** Drops the entries that link into a section taken out of service (Nav, Footer, sitemap, llms). */
export function withoutOutOfService<T>(
  items: readonly T[],
  sections: SiteConfig['sections'],
  pathOf: (item: T) => string
): T[] {
  return items.filter((item) => {
    const section = sectionForPath(pathOf(item));
    return !section || sections[section] !== 'outOfService';
  });
}
