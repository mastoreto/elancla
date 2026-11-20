import { getSiteConfig } from '@ancla/content';
import type { APIRoute } from 'astro';
import { entryUrls, getSiteIndex } from 'src/data/siteIndex';
import { localeMeta } from 'src/i18n/config';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async ({ locals }) => {
  const site = locals.site ?? (await getSiteConfig());
  const entries = await getSiteIndex(site);

  const urls = entries.flatMap((entry) => {
    const versions = entryUrls(entry, site.url);
    // hreflang alternates only where several language versions exist (and each lists itself).
    const alternates =
      versions.length > 1
        ? [
            ...versions.map(
              (v) =>
                `<xhtml:link rel="alternate" hreflang="${localeMeta[v.locale].hreflang}" href="${esc(v.url)}"/>`
            ),
            `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(versions[0].url)}"/>`,
          ].join('')
        : '';
    return versions.map(
      (v) =>
        `<url><loc>${esc(v.url)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}${alternates}</url>`
    );
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=600',
    },
  });
};
