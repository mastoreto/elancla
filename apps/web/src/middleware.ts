import { defineMiddleware } from 'astro:middleware';
import { getSiteConfig } from '@ancla/content';

// SSR: lee el estado del sitio (online/maintenance/closed) en vivo por request y
// lo deja en locals. Así el Layout muestra la pantalla de mantenimiento/cerrado
// al instante cuando el admin cambia el estado, sin necesidad de rebuild.
export const onRequest = defineMiddleware(async (context, next) => {
  try {
    context.locals.site = await getSiteConfig();
  } catch {
    // getSiteConfig ya cae a SITE_FALLBACK; si algo falla, no bloqueamos el render.
  }
  return next();
});
