export const OFFLINE_RETRY_AFTER_SECONDS = 300;

const HTML_CONTENT_TYPE = 'text/html';
const NOT_FOUND = 404;
const REDIRECT_START = 300;

/**
 * The maintenance/closed screen replaces a page's content, so the response must say so: 503 with
 * `Retry-After` and `noindex` keep search engines from indexing the notice in place of the page.
 * Only HTML pages change; redirects, endpoints (sitemap, llms.txt, API) and assets pass through.
 */
export function markSiteOffline(response: Response): Response {
  const isPage = response.headers
    .get('content-type')
    ?.startsWith(HTML_CONTENT_TYPE);
  const isRenderedPage =
    response.status < REDIRECT_START || response.status === NOT_FOUND;
  if (!isPage || !isRenderedPage) return response;

  const headers = new Headers(response.headers);
  headers.set('Retry-After', String(OFFLINE_RETRY_AFTER_SECONDS));
  headers.set('X-Robots-Tag', 'noindex');
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: 503,
    statusText: 'Service Unavailable',
    headers,
  });
}
