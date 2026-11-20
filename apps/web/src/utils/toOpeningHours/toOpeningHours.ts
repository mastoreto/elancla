import type { ServiceTime } from '@ancla/content';

const SCHEMA_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/** schema.org `openingHours` text ("Su 09:30-11:00") for the worship slots only. */
export function toOpeningHours(times: readonly ServiceTime[]): string[] {
  return times
    .filter((time) => time.kind === 'worship')
    .map((time) => {
      const day = SCHEMA_WEEKDAYS[time.weekday];
      return time.end
        ? `${day} ${time.start}-${time.end}`
        : `${day} ${time.start}`;
    });
}
