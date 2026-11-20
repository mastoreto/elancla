import { describe, expect, test } from 'bun:test';
import type { ContentSection } from 'src/data/contentPages';
import { getVisibleSections } from './getVisibleSections';

const section = (id: string, type: 'prose' | 'team'): ContentSection => ({
  id,
  eyebrow: id,
  tocLabel: id,
  title: { text: id },
  blocks: type === 'team' ? [{ type }] : [{ type, paragraphs: [] }],
});

const sections = [section('historia', 'prose'), section('equipo', 'team')];

describe('getVisibleSections', () => {
  test('keeps every section when there are people', () => {
    expect(getVisibleSections(sections, true)).toEqual(sections);
  });

  test('drops the team section when the list is empty', () => {
    expect(getVisibleSections(sections, false).map((s) => s.id)).toEqual([
      'historia',
    ]);
  });
});
