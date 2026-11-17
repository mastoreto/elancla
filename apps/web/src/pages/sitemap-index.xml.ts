import type { APIRoute } from 'astro';

// The old sitemap index may already be known to search engines.
export const GET: APIRoute = ({ redirect }) => redirect('/sitemap.xml', 301);
