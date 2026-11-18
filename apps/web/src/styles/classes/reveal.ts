/**
 * Scroll-in entrance: the element waits 24px low and transparent until a page script adds `.in`
 * (an IntersectionObserver over `[data-reveal]`). Elements with their own transition take only
 * `REVEAL_STATE`.
 */
export const REVEAL_STATE =
  'opacity-0 [transform:translate3d(0,24px,0)] [&.in]:opacity-100 [&.in]:[transform:none]';

export const REVEAL_TRANSITION =
  '[transition:opacity_0.9s_var(--ease-obra),transform_0.9s_var(--ease-obra)]';

export const REVEAL = [REVEAL_STATE, REVEAL_TRANSITION];
