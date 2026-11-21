import { describe, expect, test } from 'bun:test';
import { buildPhotoSrcSet } from './buildPhotoSrcSet';

describe('buildPhotoSrcSet', () => {
  test('returns null without photo or variants', () => {
    expect(buildPhotoSrcSet(null)).toBeNull();
    expect(buildPhotoSrcSet([])).toBeNull();
  });

  test('orders the variants by width and uses the largest as src', () => {
    const sources = buildPhotoSrcSet([
      { url: '/m.webp', width: 640, height: 640 },
      { url: '/s.webp', width: 320, height: 320 },
      { url: '/l.webp', width: 1280, height: 1280 },
    ]);
    expect(sources).toEqual({
      src: '/l.webp',
      srcset: '/s.webp 320w, /m.webp 640w, /l.webp 1280w',
    });
  });
});
