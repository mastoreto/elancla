import type { CalendarEvent } from 'src/sections/calendar/types';

/** What the page shows: the place name, `tbcLabel` while it is to be confirmed, or nothing. */
export function eventPlaceName(
  place: CalendarEvent['place'],
  tbcLabel: string
): string {
  if (place === 'tbc') return tbcLabel;
  return place?.name ?? '';
}

/** What calendar apps get as the location: name and address, empty while to be confirmed. */
export function eventLocation(place: CalendarEvent['place']): string {
  if (!place || place === 'tbc') return '';
  return [place.name, place.address].filter(Boolean).join(', ');
}
