import type {
  TogetherCell,
  TogetherRow,
} from 'src/sections/landing/Together/types';

/** Fixed photos of the design (D-28); the layout never places more than these. */
export const TOGETHER_PHOTO_COUNT = 3;

// Design H, measured on the 13 ministries of the church: desktop rows of 5, 4, 4 and 3 tiles
// and the flex ratio of each tile. Other counts reuse the same rhythm.
const ROW_SIZES = [5, 4, 4, 3];
const MIN_ROW_SIZE = 3;
const WIDTHS = [
  260, 300, 220, 240, 228, 292, 300, 360, 308, 240, 300, 360, 360, 300, 340,
  340,
];
const DESIGN_LINK_COUNT = 13;
// How many links come before each photo in the desktop rows and in the stacked grids.
const DESKTOP_SLOTS = [1, 4, 9];
const TABLET_SLOTS = [4, 7, 10];
const MOBILE_SLOTS = [2, 6, 10];
const LINKS_PER_PHOTO = 4;

/** Links before each photo, scaled from the 13-ministry design to `linkCount`. */
function photoSlots(
  slots: readonly number[],
  linkCount: number,
  photoCount: number
): number[] {
  return slots.slice(0, photoCount).map((slot) => {
    const scaled = Math.round((slot * linkCount) / DESIGN_LINK_COUNT);
    return Math.min(linkCount, Math.max(1, scaled));
  });
}

type Slot = { kind: 'link'; index: number } | { kind: 'photo'; index: number };

/** Links and photos in reading order, the photos after `slots[i]` links. */
function interleave(linkCount: number, slots: readonly number[]): Slot[] {
  const sequence: Slot[] = [];
  for (let link = 0; link <= linkCount; link += 1) {
    slots.forEach((slot, photo) => {
      if (slot === link) sequence.push({ kind: 'photo', index: photo });
    });
    if (link < linkCount) sequence.push({ kind: 'link', index: link });
  }
  return sequence;
}

function rowSizesFor(total: number): number[] {
  const sizes: number[] = [];
  let remaining = total;
  for (let row = 0; remaining > 0; row += 1) {
    const size = Math.min(ROW_SIZES[row % ROW_SIZES.length], remaining);
    sizes.push(size);
    remaining -= size;
  }
  // A short last row borrows from the one above (or joins it) so no row is left with one or two.
  const last = sizes.length - 1;
  if (last > 0 && sizes[last] < MIN_ROW_SIZE) {
    const borrowed = MIN_ROW_SIZE - sizes[last];
    if (sizes[last - 1] - borrowed >= MIN_ROW_SIZE) {
      sizes[last - 1] -= borrowed;
      sizes[last] += borrowed;
    } else {
      sizes[last - 1] += sizes[last];
      sizes.pop();
    }
  }
  return sizes;
}

function positionOf(sequence: readonly Slot[], slot: Slot): number {
  return (
    sequence.findIndex(
      (entry) => entry.kind === slot.kind && entry.index === slot.index
    ) + 1
  );
}

/**
 * Lays the ministry tiles of the landing mosaic out in desktop rows (with their flex ratios) and
 * in the order of the stacked grids, mixing in the fixed design photos. With the 13 ministries of
 * the church it is exactly the hand-made layout it replaces; with any other count it keeps the
 * same rhythm with rows of 3 to 5 tiles, no empty row and no photo repeated.
 */
export function buildTogetherLayout<Tile>(
  tiles: readonly Tile[]
): TogetherRow<Tile>[] {
  const linkCount = tiles.length;
  if (linkCount === 0) return [];
  const photoCount = Math.min(
    TOGETHER_PHOTO_COUNT,
    Math.ceil(linkCount / LINKS_PER_PHOTO)
  );
  const desktop = interleave(
    linkCount,
    photoSlots(DESKTOP_SLOTS, linkCount, photoCount)
  );
  const tablet = interleave(
    linkCount,
    photoSlots(TABLET_SLOTS, linkCount, photoCount)
  );
  const mobile = interleave(
    linkCount,
    photoSlots(MOBILE_SLOTS, linkCount, photoCount)
  );

  const sizes = rowSizesFor(desktop.length);
  const rows: TogetherRow<Tile>[] = [];
  let cursor = 0;
  for (const [rowIndex, size] of sizes.entries()) {
    const row: TogetherRow<Tile> = [];
    const tilesBelow = sizes
      .slice(rowIndex + 1)
      .reduce((sum, below) => sum + below, 0);
    for (let column = 0; column < size; column += 1) {
      const slot = desktop[cursor];
      const placement = {
        w: WIDTHS[cursor % WIDTHS.length],
        ot: positionOf(tablet, slot),
        om: positionOf(mobile, slot),
        order: tilesBelow + column,
      };
      row.push(
        slot.kind === 'link'
          ? ({
              ...placement,
              kind: 'link',
              tile: tiles[slot.index],
            } as TogetherCell<Tile>)
          : { ...placement, kind: 'photo', photo: slot.index }
      );
      cursor += 1;
    }
    rows.push(row);
  }
  return rows;
}
