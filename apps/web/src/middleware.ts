import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '@ancla/content';
import { markSiteOffline } from 'src/utils/markSiteOffline';

// SSR: lee el estado del sitio (online/maintenance/closed) en vivo por request y
// lo deja en locals. Así el Layout muestra la pantalla de mantenimiento/cerrado
// al instante cuando el admin cambia el estado, sin necesidad de rebuild.
// Si el sitio no está online, las páginas salen como 503 + Retry-After + noindex.
export const onRequest = defineMiddleware(async (context, next) => {
  try {
    context.locals.site = await getSiteConfig();
  } catch {
    // getSiteConfig ya cae a SITE_FALLBACK; si algo falla, no bloqueamos el render.
  }
  const response = await next();
  return context.locals.site && context.locals.site.status !== 'online'
    ? markSiteOffline(response)
    : response;
});
