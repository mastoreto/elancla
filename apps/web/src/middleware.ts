import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '@ancla/content';
import { getLocaleFromUrl, localizePath } from 'src/i18n/utils';
import { markSiteOffline } from 'src/utils/markSiteOffline';
import { sectionForPath } from 'src/utils/sectionForPath';

// SSR: lee el estado del sitio (online/maintenance/closed) en vivo por request y
// lo deja en locals. Así el Layout muestra la pantalla de mantenimiento/cerrado
// al instante cuando el admin cambia el estado, sin necesidad de rebuild.
// Si el sitio no está online, las páginas salen como 503 + Retry-After + noindex.
// Lo mismo por sección (D-33): en mantenimiento el Layout muestra la pantalla de
// sección (503); fuera de servicio se reescribe a la 404.
export const onRequest = defineMiddleware(async (context, next) => {
  const locale = getLocaleFromUrl(context.url);
  try {
    context.locals.site = await getSiteConfig(locale);
  } catch {
    // getSiteConfig ya cae a SITE_FALLBACK; si algo falla, no bloqueamos el render.
  }
  const site = context.locals.site;
  if (!site) return next();
  if (site.status !== 'online') return markSiteOffline(await next());

  const section = sectionForPath(context.url.pathname);
  const sectionStatus = section ? site.sections[section] : 'active';
  if (sectionStatus === 'outOfService') {
    return context.rewrite(localizePath('/404', locale));
  }
  if (sectionStatus === 'maintenance') {
    context.locals.sectionMaintenance = true;
    return markSiteOffline(await next());
  }
  return next();
});
