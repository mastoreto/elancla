/** One placed tile of the mosaic: a ministry link or one of the fixed design photos. */
export type TogetherCell<Tile> = {
  /** Flex ratio of the tile inside its desktop row. */
  w: number;
  /** Order in the stacked tablet (3 columns) and mobile (2 columns) grids. */
  ot: number;
  om: number;
  /** Order of the entrance animation: bottom row first, left to right. */
  order: number;
} & ({ kind: 'link'; tile: Tile } | { kind: 'photo'; photo: number });

export type TogetherRow<Tile> = TogetherCell<Tile>[];
