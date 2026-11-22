import type { CalendarMinistry } from 'src/sections/calendar/types';

/**
 * Filter keys of the ministries an event belongs to, space separated: the index of each ministry
 * in the calendar's ministry list. Empty for an event of the church in general.
 */
export function ministryFilterKeys(
  eventMinistries: string[],
  ministries: CalendarMinistry[]
): string {
  return eventMinistries
    .map((name) => ministries.findIndex((ministry) => ministry.name === name))
    .filter((index) => index >= 0)
    .join(' ');
}
