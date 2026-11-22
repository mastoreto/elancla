import type { CalendarMinistryColor } from 'src/sections/calendar/types';

/** CSS value of a ministry color token (`obra-red` -> the `--color-obra-red` theme variable). */
export function ministryColorVar(color: CalendarMinistryColor): string {
  return `var(--color-${color})`;
}
