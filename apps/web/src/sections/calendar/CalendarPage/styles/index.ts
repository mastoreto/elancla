/** Class lists shared by the yearly calendar sections (`/calendario-anual`). */

/** Every section: gutter padding and a vertical stack; pair it with a `SECTION_SPACING` entry. */
export const SECTION = 'flex scroll-mt-16 flex-col px-gutter';

export const SECTION_SPACING = {
  hero: 'gap-7 pt-[clamp(7rem,12vw,8.5rem)] max-md:gap-5.5 max-md:pt-26',
  default: 'gap-6 pt-[clamp(4rem,8vw,6rem)] max-md:gap-4.5 max-md:pt-14',
} as const;

/** Section title; its emphasised tail uses `EMPHASIS`. */
export const TITLE =
  'ln-h text-[clamp(2.5rem,5vw,4.5rem)] max-md:text-[2.375rem]';
export const EMPHASIS = 'text-obra-red not-italic';

export const LEAD =
  'm-0 max-w-140 text-[1rem] leading-normal text-obra-ink-soft max-md:text-[1.0625rem]';

/** Ministry color dot; the color comes from the `--c` custom property. */
export const DOT = 'size-2.25 flex-none rounded-full bg-(--c)';

export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obra-red';
