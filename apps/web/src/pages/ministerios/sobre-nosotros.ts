import type { APIRoute } from 'astro';

// Old placeholder page; the real "Sobre nosotros" lives at /nosotros.
export const GET: APIRoute = ({ redirect }) => redirect('/nosotros', 301);
