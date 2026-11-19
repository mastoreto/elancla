import { describe, expect, test } from 'bun:test';
import { markSiteOffline } from './markSiteOffline';

const html = (status = 200) =>
  new Response('<p>x</p>', {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

describe('markSiteOffline', () => {
  test('turns a rendered page into a 503 that search engines will not index', async () => {
    const response = markSiteOffline(html());
    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('300');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(await response.text()).toBe('<p>x</p>');
  });

  test('also covers the 404 page, which renders the same screen', () => {
    expect(markSiteOffline(html(404)).status).toBe(503);
  });

  test('leaves redirects, server errors and non-HTML responses alone', () => {
    const redirect = new Response(null, {
      status: 302,
      headers: { location: '/' },
    });
    expect(markSiteOffline(redirect)).toBe(redirect);
    const error = html(500);
    expect(markSiteOffline(error)).toBe(error);
    const sitemap = new Response('<xml/>', {
      headers: { 'content-type': 'application/xml' },
    });
    expect(markSiteOffline(sitemap)).toBe(sitemap);
  });
});
