import { z } from 'zod';

// A slug is kebab-case (the contract's `blogSlug`); the bound keeps a hostile body from reaching
// the SDK as a long string.
const SLUG_MAX_LENGTH = 80;
const beaconBody = z.strictObject({
  slug: z.string().trim().min(1).max(SLUG_MAX_LENGTH),
});

export type RecordView = (
  slug: string,
  visitor: { ip: string; userAgent: string }
) => Promise<void>;

interface BeaconRequest {
  request: Request;
  /** The address of the reader as the server sees it (`Astro.clientAddress`). */
  clientAddress: string;
}

const NO_CONTENT = 204;
const BAD_REQUEST = 400;

/**
 * `POST /api/views`: validates the beacon, takes the reader's address and user agent from the
 * request (never from the body: the page cannot choose who it counts as) and hands them to the
 * SDK. 204 whether or not the view counted, 400 only for a body that is not `{ slug }`.
 */
export async function handleViewBeacon(
  { request, clientAddress }: BeaconRequest,
  recordView: RecordView
): Promise<Response> {
  const body = beaconBody.safeParse(await request.json().catch(() => null));
  if (!body.success) return new Response(null, { status: BAD_REQUEST });
  await recordView(body.data.slug, {
    ip: clientAddress,
    userAgent: request.headers.get('user-agent') ?? '',
  });
  return new Response(null, { status: NO_CONTENT });
}
