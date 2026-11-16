// Sample data for /calendario-anual. It will be replaced by content coming from the admin app;
// keep the shapes below as the contract (CalendarMinistry / WeeklyActivity / CalendarEvent).

export const MINISTRY_KEYS = [
  'preaching',
  'men',
  'teaching',
  'youth',
  'missions',
  'teens',
  'worship',
  'media',
  'prayer',
  'women',
] as const;

export type MinistryKey = (typeof MINISTRY_KEYS)[number];

export const MINISTRY_COLORS: Record<MinistryKey, string> = {
  preaching: '#a8141b',
  men: '#151515',
  teaching: '#7c6452',
  youth: '#b19f86',
  missions: '#3d3634',
  teens: '#d9a0a3',
  worship: '#947a62',
  media: '#655247',
  prayer: '#c8bda9',
  women: '#53443b',
};

export interface WeeklyActivity {
  /** 0 = Monday … 6 = Sunday */
  day: number;
  time: string;
  title: string;
  ministry: MinistryKey;
  /** Only the Sunday schedule is real; the rest is sample data. */
  isExample: boolean;
}

export interface CalendarEvent {
  /** ISO date (yyyy-mm-dd) */
  date: string;
  time: string;
  title: string;
  place: string;
  ministry: MinistryKey;
}

export const CALENDAR_YEAR = 2027;

export const weeklyActivities: WeeklyActivity[] = [
  { day: 1, time: '19:30', title: 'Estudio bíblico', ministry: 'teaching', isExample: true },
  { day: 2, time: '20:00', title: 'Reunión de oración', ministry: 'prayer', isExample: true },
  { day: 3, time: '20:00', title: 'Ensayo de alabanza', ministry: 'worship', isExample: true },
  { day: 4, time: '19:30', title: 'Reunión de jóvenes', ministry: 'youth', isExample: true },
  { day: 5, time: '17:00', title: 'Reunión de adolescentes', ministry: 'teens', isExample: true },
  { day: 6, time: '10:00', title: 'Escuela bíblica', ministry: 'teaching', isExample: false },
  { day: 6, time: '11:15', title: 'Culto de celebración', ministry: 'preaching', isExample: false },
];

const HALL = 'Salón principal';
const TEMPLE = 'Templo';
const TBC = 'tbc';

export const events: CalendarEvent[] = [
  { date: '2027-01-16', time: '11:15', title: 'Culto de apertura del año', place: TEMPLE, ministry: 'preaching' },
  { date: '2027-02-06', time: '16:00', title: 'Taller de enseñanza bíblica', place: HALL, ministry: 'teaching' },
  { date: '2027-02-20', time: '20:00', title: 'Noche de alabanza', place: TEMPLE, ministry: 'worship' },
  { date: '2027-03-12', time: '19:30', title: 'Encuentro de mujeres', place: HALL, ministry: 'women' },
  { date: '2027-03-27', time: '10:00', title: 'Retiro de adolescentes', place: TBC, ministry: 'teens' },
  { date: '2027-04-09', time: '21:00', title: 'Vigilia de Semana Santa', place: TEMPLE, ministry: 'prayer' },
  { date: '2027-04-24', time: '20:00', title: 'Cena de hombres', place: HALL, ministry: 'men' },
  { date: '2027-05-08', time: '19:30', title: 'Encuentro de jóvenes', place: HALL, ministry: 'youth' },
  { date: '2027-05-16', time: '20:00', title: 'Cena de hombres', place: HALL, ministry: 'men' },
  { date: '2027-05-21', time: '20:00', title: 'Noche de oración', place: TEMPLE, ministry: 'prayer' },
  { date: '2027-05-29', time: '10:00', title: 'Jornada misionera', place: TBC, ministry: 'missions' },
  { date: '2027-06-05', time: '16:00', title: 'Taller de multimedia', place: HALL, ministry: 'media' },
  { date: '2027-06-19', time: '19:30', title: 'Encuentro de jóvenes', place: HALL, ministry: 'youth' },
  { date: '2027-07-03', time: '10:00', title: 'Jornada misionera', place: TBC, ministry: 'missions' },
  { date: '2027-07-17', time: '20:00', title: 'Noche de oración', place: TEMPLE, ministry: 'prayer' },
  { date: '2027-08-07', time: '19:30', title: 'Encuentro de mujeres', place: HALL, ministry: 'women' },
  { date: '2027-08-21', time: '20:00', title: 'Cena de hombres', place: HALL, ministry: 'men' },
  { date: '2027-09-04', time: '09:00', title: 'Campamento de adolescentes', place: TBC, ministry: 'teens' },
  { date: '2027-09-18', time: '20:00', title: 'Noche de alabanza', place: TEMPLE, ministry: 'worship' },
  { date: '2027-10-02', time: '19:30', title: 'Encuentro de jóvenes', place: HALL, ministry: 'youth' },
  { date: '2027-10-16', time: '16:00', title: 'Taller de enseñanza bíblica', place: HALL, ministry: 'teaching' },
  { date: '2027-10-30', time: '10:00', title: 'Conferencia de misiones', place: TBC, ministry: 'missions' },
  { date: '2027-11-06', time: '20:00', title: 'Noche de oración', place: TEMPLE, ministry: 'prayer' },
  { date: '2027-11-20', time: '20:00', title: 'Cena de hombres', place: HALL, ministry: 'men' },
  { date: '2027-12-11', time: '19:30', title: 'Encuentro de mujeres', place: HALL, ministry: 'women' },
  { date: '2027-12-18', time: '19:00', title: 'Culto de Navidad', place: TEMPLE, ministry: 'preaching' },
  { date: '2027-12-25', time: '11:15', title: 'Celebración de Navidad', place: TEMPLE, ministry: 'preaching' },
];

/** `place: 'tbc'` is the marker for "to be confirmed" so the label can be translated. */
export const PLACE_TBC = TBC;

/** Events grouped by month index (0-11), in date order. */
export function groupEventsByMonth(list: CalendarEvent[]): { month: number; events: CalendarEvent[] }[] {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = new Map<number, CalendarEvent[]>();
  for (const event of sorted) {
    const month = Number(event.date.slice(5, 7)) - 1;
    byMonth.set(month, [...(byMonth.get(month) ?? []), event]);
  }
  return [...byMonth.entries()].map(([month, monthEvents]) => ({ month, events: monthEvents }));
}

/** Google Calendar "add event" link (floating local time, 2 h default length). */
export function googleCalendarUrl(event: CalendarEvent, place: string): string {
  const [y, m, d] = event.date.split('-').map(Number);
  const [h, min] = event.time.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = (hours: number) => `${y}${pad(m)}${pad(d)}T${pad(hours)}${pad(min)}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(h)}/${stamp(Math.min(h + 2, 23))}`,
    location: place,
    ctz: 'America/Montevideo',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
