import type { APIRoute } from 'astro';
import { getLiveStream } from 'src/data/youtube';

// Polled by the site header (src/scripts/live). The CDN cache keeps YouTube quota use at ~1 call per minute.
export const GET: APIRoute = async () => {
  const live = await getLiveStream();
  return new Response(
    JSON.stringify(live ? { live: true, ...live } : { live: false }),
    {
      headers: {
        'Content-Type': 'application/json',
        // Browsers always revalidate (max-age=0); only the CDN keeps it for a minute.
        'Cache-Control':
          'public, max-age=0, s-maxage=60, stale-while-revalidate=30',
      },
    }
  );
};
