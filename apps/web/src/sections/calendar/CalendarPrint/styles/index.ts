/** Class lists shared by the printable calendars (A3 sheet, A4 booklet, 16:9 slides). */

/** One printed page; `print:` drops the screen preview shadow and rounding. */
export const SHEET =
  'relative box-border flex flex-col overflow-hidden shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] print:rounded-none! print:shadow-none';

export const SERIF = 'font-obra-serif font-bold';

/** Pair with an `EYEBROW_TONE` entry. */
export const EYEBROW = 'text-[13px] font-bold tracking-[0.16em] uppercase';
export const EYEBROW_TONE = {
  red: 'text-obra-red',
  ink: 'text-obra-muted',
  live: 'text-obra-red-live',
} as const;

/** Light paper or dark cover pages. */
export const SHEET_TONE = {
  light: 'bg-obra-cream text-obra-ink',
  dark: 'bg-obra-warm text-obra-cream',
} as const;

export const SLIDE_TONE = {
  light: 'bg-obra-paper',
  dark: 'bg-obra-warm text-obra-cream',
} as const;
