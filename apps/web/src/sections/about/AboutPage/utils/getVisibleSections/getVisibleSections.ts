import type { ContentSection } from 'src/data/contentPages';

/** Sections of the About page; the one holding the team block is dropped when nobody is listed. */
export function getVisibleSections(
  sections: ContentSection[],
  hasTeam: boolean
): ContentSection[] {
  if (hasTeam) return sections;
  return sections.filter(
    (section) => !section.blocks.some((block) => block.type === 'team')
  );
}
