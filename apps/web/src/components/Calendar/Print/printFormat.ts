import { PLACE_TBC, type CalendarEvent } from 'src/data/calendar';
import { getMessages } from 'src/i18n/messages';

// The printed calendar is in Spanish, whatever the visitor's site language.
export const MONTHS_ES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2027, i, 1)))
).map((m) => m.charAt(0).toUpperCase() + m.slice(1));

const WEEKDAYS = new Intl.DateTimeFormat('es-UY', { weekday: 'short', timeZone: 'UTC' });
export const weekdayShort = (iso: string) =>
  WEEKDAYS.format(new Date(`${iso}T00:00:00Z`)).replace('.', '');
export const weekdayShortByIndex = (day: number) => weekdayShort(`2027-01-${String(4 + day).padStart(2, '0')}`);
export const weekdayLong = (day: number) => {
  const name = new Intl.DateTimeFormat('es-UY', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2027, 0, 4 + day)));
  return name.charAt(0).toUpperCase() + name.slice(1);
};
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const ministryEs = getMessages('es').calendar.ministries;
export const placeEs = (event: CalendarEvent) => (event.place === PLACE_TBC ? 'Por confirmar' : event.place);
export const dayOf = (event: CalendarEvent) => Number(event.date.slice(8));
