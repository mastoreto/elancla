// Drifting columns (design "B3"): every column scrolls forever, alternating up/down.
// `n` is the photo (public/images/hero/hero<n>-md.webp), `h` its height in px at full scale,
// `pos` the object-position that keeps the subject in frame.
export interface PhotoTile {
  n: number;
  h: number;
  pos: string;
}

export interface PhotoColumn {
  tiles: PhotoTile[];
  dir: 'up' | 'down';
  secs: number;
  offset: number;
}

export const HERO_PHOTO_COLUMNS: PhotoColumn[] = [
  {
    dir: 'up',
    secs: 80,
    offset: -60,
    tiles: [
      { n: 10, h: 340, pos: '50% 55%' },
      { n: 5, h: 280, pos: '50% 50%' },
      { n: 8, h: 360, pos: '50% 55%' },
      { n: 3, h: 300, pos: '50% 25%' },
      { n: 6, h: 320, pos: '40% 50%' },
    ],
  },
  {
    dir: 'down',
    secs: 95,
    offset: -260,
    tiles: [
      { n: 2, h: 300, pos: '50% 30%' },
      { n: 7, h: 360, pos: '50% 60%' },
      { n: 4, h: 280, pos: '50% 40%' },
      { n: 1, h: 340, pos: '50% 70%' },
      { n: 10, h: 300, pos: '50% 40%' },
    ],
  },
  {
    dir: 'up',
    secs: 70,
    offset: -120,
    tiles: [
      { n: 8, h: 360, pos: '50% 55%' },
      { n: 6, h: 300, pos: '40% 50%' },
      { n: 5, h: 320, pos: '50% 45%' },
      { n: 3, h: 280, pos: '50% 30%' },
      { n: 2, h: 340, pos: '50% 35%' },
    ],
  },
  {
    dir: 'down',
    secs: 88,
    offset: -340,
    tiles: [
      { n: 4, h: 280, pos: '50% 40%' },
      { n: 1, h: 340, pos: '50% 70%' },
      { n: 7, h: 300, pos: '50% 60%' },
      { n: 10, h: 360, pos: '50% 55%' },
      { n: 6, h: 300, pos: '40% 50%' },
    ],
  },
];
