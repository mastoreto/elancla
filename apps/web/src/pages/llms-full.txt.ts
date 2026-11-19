import type { APIRoute } from 'astro';
import { buildLlmsFullTxt } from 'src/utils/llms';

export const GET: APIRoute = async ({ locals }) =>
  new Response(await buildLlmsFullTxt(locals.site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=600',
    },
  });
