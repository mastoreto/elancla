import type { APIRoute } from 'astro';
import { events } from 'src/data/calendar';

// Subscription feed built from the same data as the page. Times are floating local (America/Montevideo).
const pad = (n: number) => String(n).padStart(2, '0');
const escapeText = (s: string) =>
  s.replace(/[;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export const GET: APIRoute = () => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Iglesia Bautista El Ancla//Calendario anual//ES',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Iglesia Bautista El Ancla',
    'X-WR-TIMEZONE:America/Montevideo',
    ...events.flatMap((e) => {
      const [y, m, d] = e.date.split('-').map(Number);
      const [h, min] = e.time.split(':').map(Number);
      const stamp = (hours: number) =>
        `${y}${pad(m)}${pad(d)}T${pad(hours)}${pad(min)}00`;
      return [
        'BEGIN:VEVENT',
        `UID:${e.date}-${e.time.replace(':', '')}-${e.ministry}@elancla.uy`,
        `DTSTAMP:${y}0101T000000Z`,
        `DTSTART;TZID=America/Montevideo:${stamp(h)}`,
        `DTEND;TZID=America/Montevideo:${stamp(Math.min(h + 2, 23))}`,
        `SUMMARY:${escapeText(e.title)}`,
        `LOCATION:${escapeText(e.place === 'tbc' ? '' : e.place)}`,
        'END:VEVENT',
      ];
    }),
    'END:VCALENDAR',
  ];
  return new Response(`${lines.join('\r\n')}\r\n`, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
