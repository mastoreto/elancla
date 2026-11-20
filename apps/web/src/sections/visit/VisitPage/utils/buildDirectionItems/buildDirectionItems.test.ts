import { describe, expect, test } from 'bun:test';
import { buildDirectionItems } from './buildDirectionItems';

const TITLES = { parking: 'P', transit: 'T', accessibility: 'A' };

describe('buildDirectionItems', () => {
  test('keeps order and drops empty or blank directions', () => {
    expect(
      buildDirectionItems(
        { parking: ' Street ', transit: null, accessibility: '  ' },
        TITLES
      )
    ).toEqual([{ title: 'P', text: 'Street' }]);
  });

  test('is empty when all three are empty', () => {
    expect(
      buildDirectionItems(
        { parking: null, transit: null, accessibility: null },
        TITLES
      )
    ).toEqual([]);
  });
});
