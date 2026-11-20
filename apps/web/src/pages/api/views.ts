import { recordPostView } from '@ancla/content';
import type { APIRoute } from 'astro';
import { handleViewBeacon } from 'src/utils/handleViewBeacon';

// Receives the beacon of the article page (same origin) and forwards it to the content API with
// the reader's real address; see `handleViewBeacon`. Never cached: every call is an event.
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const response = await handleViewBeacon(
    { request, clientAddress },
    recordPostView
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
};
