/** The three fixed photos of the mosaic (D-28), in the order the layout places them. */
export interface TogetherPhoto {
  key: 'youth' | 'women' | 'kids';
  src: string;
  /** Inline crop of the desktop rows; the stacked grids use `pos` with `object-fit`. */
  crop: string;
  pos: string;
  /** Spans the full width of the tablet grid. */
  wide?: boolean;
}

export const TOGETHER_PHOTOS: readonly TogetherPhoto[] = [
  {
    key: 'youth',
    src: '/images/comunidad.jpg',
    crop: 'width:240%;left:-110%;top:-150%',
    pos: '55% 70%',
  },
  {
    key: 'women',
    src: '/images/salon.jpg',
    crop: 'width:260%;left:-60%;top:-210%',
    pos: '50% 40%',
  },
  {
    key: 'kids',
    src: '/images/comunidad.jpg',
    crop: 'width:200%;left:-50%;top:-200%',
    pos: '50% 72%',
    wide: true,
  },
];
