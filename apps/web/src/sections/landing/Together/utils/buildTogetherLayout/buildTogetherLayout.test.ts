import { describe, expect, test } from 'bun:test';
import { buildTogetherLayout } from './buildTogetherLayout';

type Kind = 'link' | 'photo';
// [kind, w, om, ot, legacy data-tile] of the rows that were hand-written in Together.astro
// before the mosaic was computed from the ministries.
const LEGACY_ROWS: [Kind, number, number, number, number][][] = [
  [
    ['link', 260, 1, 1, 8],
    ['photo', 300, 3, 5, 9],
    ['link', 220, 2, 2, 10],
    ['link', 240, 4, 3, 11],
    ['link', 228, 5, 4, 12],
  ],
  [
    ['photo', 292, 8, 9, 4],
    ['link', 300, 6, 6, 5],
    ['link', 360, 7, 7, 6],
    ['link', 308, 9, 8, 7],
  ],
  [
    ['link', 240, 10, 10, 0],
    ['link', 300, 11, 11, 1],
    ['photo', 360, 13, 13, 2],
    ['link', 360, 12, 12, 3],
  ],
  [
    ['link', 300, 14, 14, -4],
    ['link', 340, 15, 15, -3],
    ['link', 340, 16, 16, -2],
  ],
];

const ministries = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `m${index}`);

const flat = (count: number) => buildTogetherLayout(ministries(count)).flat();

describe('buildTogetherLayout', () => {
  test('reproduces the hand-written layout for the 13 seeded ministries', () => {
    const rows = buildTogetherLayout(ministries(13));
    expect(
      rows.map((row) =>
        row.map((cell) => [cell.kind, cell.w, cell.om, cell.ot])
      )
    ).toEqual(
      LEGACY_ROWS.map((row) =>
        row.map(([kind, w, om, ot]) => [kind, w, om, ot])
      )
    );
  });

  test('keeps the legacy links in order and the photos as youth, women and kids', () => {
    const cells = buildTogetherLayout(ministries(13)).flat();
    expect(
      cells.flatMap((cell) => (cell.kind === 'link' ? [cell.tile] : []))
    ).toEqual(ministries(13));
    expect(
      cells.flatMap((cell) => (cell.kind === 'photo' ? [cell.photo] : []))
    ).toEqual([0, 1, 2]);
  });

  test('animates bottom row first, left to right, like the legacy data-tile', () => {
    const cells = buildTogetherLayout(ministries(13)).flat();
    const legacy = LEGACY_ROWS.flat();
    const rank = (values: number[]) =>
      values.map((value) => [...values].sort((a, b) => a - b).indexOf(value));
    expect(rank(cells.map((cell) => cell.order))).toEqual(
      rank(legacy.map(([, , , , order]) => order))
    );
  });

  test('0 ministries make no rows', () => {
    expect(buildTogetherLayout([])).toEqual([]);
  });

  test.each([
    1, 2, 3, 5, 8, 13, 20, 40,
  ])('%i ministries: every link once, no repeated photo, no empty row, orders are a permutation', (count) => {
    const rows = buildTogetherLayout(ministries(count));
    const cells = rows.flat();
    expect(rows.every((row) => row.length > 0 && row.length <= 5)).toBe(true);
    const links = cells.flatMap((cell) =>
      cell.kind === 'link' ? [cell.tile] : []
    );
    expect(links).toEqual(ministries(count));
    const photos = cells.flatMap((cell) =>
      cell.kind === 'photo' ? [cell.photo] : []
    );
    expect(new Set(photos).size).toBe(photos.length);
    expect(photos.length).toBeLessThanOrEqual(3);
    const sequence = Array.from({ length: cells.length }, (_, i) => i + 1);
    expect(cells.map((cell) => cell.om).sort((a, b) => a - b)).toEqual(
      sequence
    );
    expect(cells.map((cell) => cell.ot).sort((a, b) => a - b)).toEqual(
      sequence
    );
    expect(new Set(cells.map((cell) => cell.order)).size).toBe(cells.length);
  });

  test('rows of 3 to 5 once there are enough tiles', () => {
    for (const count of [5, 13, 20, 40]) {
      const rows = buildTogetherLayout(ministries(count));
      expect(rows.every((row) => row.length >= 3 && row.length <= 5)).toBe(
        true
      );
    }
  });

  test('1 ministry is a single row with its link', () => {
    expect(flat(1).filter((cell) => cell.kind === 'link')).toHaveLength(1);
  });
});
