import type {
  MinistrySection,
  MinistrySectionInput,
  MinistrySectionKey,
} from '../../types';

const SECTION_IDS: Record<MinistrySectionKey, string> = {
  about: 'sobre',
  facts: 'datos',
  next: 'siguiente-paso',
};

/**
 * The sections a ministry page shows, in order, numbered. "About" is always there; the practical
 * facts and the next step only when the ministry has something to say in them, so a short profile
 * never renders empty blocks.
 */
export function buildMinistrySections(
  ministry: MinistrySectionInput
): MinistrySection[] {
  const hasFacts = Boolean(
    ministry.place ||
      ministry.audience ||
      ministry.howToJoin ||
      ministry.schedule.length > 0 ||
      ministry.leaders.length > 0
  );
  const keys: MinistrySectionKey[] = [
    'about',
    ...(hasFacts ? (['facts'] as const) : []),
    ...(ministry.nextStep ? (['next'] as const) : []),
  ];
  return keys.map((key, index) => ({
    key,
    id: SECTION_IDS[key],
    number: String(index + 1).padStart(2, '0'),
  }));
}
