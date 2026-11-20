import type { VisitContent } from '@ancla/content';

export interface DirectionItem {
  title: string;
  text: string;
}

export type DirectionTitles = Record<keyof VisitContent['directions'], string>;

const DIRECTION_ORDER = ['parking', 'transit', 'accessibility'] as const;

/** Directions with text, in display order. Blank ones are dropped so they are never rendered. */
export function buildDirectionItems(
  directions: VisitContent['directions'],
  titles: DirectionTitles
): DirectionItem[] {
  return DIRECTION_ORDER.flatMap((key) => {
    const text = directions[key]?.trim();
    return text ? [{ title: titles[key], text }] : [];
  });
}
