import type { PublicMinistry } from '@ancla/content';

export type MinistrySectionKey = 'about' | 'facts' | 'next';

export interface MinistrySection {
  key: MinistrySectionKey;
  /** Anchor of the section and target of its table-of-contents link. */
  id: string;
  /** Position shown in the eyebrow and the table of contents: `01`, `02`... */
  number: string;
}

export type MinistrySectionInput = Pick<
  PublicMinistry,
  'place' | 'audience' | 'howToJoin' | 'nextStep' | 'leaders'
>;
