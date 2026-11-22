import { getCalendar, getSiteConfig } from '@ancla/content';
import type { APIRoute } from 'astro';
import { buildIcs } from 'src/sections/calendar/utils';

// Subscription feed of the public events of the current year, from the same API as the page.
export const GET: APIRoute = async ({ locals }) => {
  const site = locals.site ?? (await getSiteConfig());
  const calendar = await getCalendar('es');
  return new Response(buildIcs(calendar, new URL(site.url).host, site.name), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
