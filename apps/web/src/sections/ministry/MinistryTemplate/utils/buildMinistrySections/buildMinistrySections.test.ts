import { describe, expect, test } from 'bun:test';
import { buildMinistrySections } from './buildMinistrySections';

const BARE = { leaders: [], schedule: [] };

describe('buildMinistrySections', () => {
  test('a bare ministry only has the about section', () => {
    expect(buildMinistrySections(BARE)).toEqual([
      { key: 'about', id: 'sobre', number: '01' },
    ]);
  });

  test('practical facts and the next step are added and numbered in order', () => {
    expect(
      buildMinistrySections({
        ...BARE,
        place: 'Salón',
        nextStep: 'Escríbenos',
      }).map(({ key, number }) => [key, number])
    ).toEqual([
      ['about', '01'],
      ['facts', '02'],
      ['next', '03'],
    ]);
  });

  test('the next step alone is the second section', () => {
    expect(
      buildMinistrySections({ ...BARE, nextStep: 'Ven' }).map(({ key }) => key)
    ).toEqual(['about', 'next']);
  });

  test('a visible leader is enough for the facts', () => {
    expect(
      buildMinistrySections({
        ...BARE,
        leaders: [{ name: 'Ana', title: 'Líder' }],
      }).map(({ key }) => key)
    ).toEqual(['about', 'facts']);
  });

  test('a weekly schedule is enough for the facts', () => {
    expect(
      buildMinistrySections({
        ...BARE,
        schedule: [{ weekday: 5, start: '20:00' }],
      }).map(({ key }) => key)
    ).toEqual(['about', 'facts']);
  });
});
