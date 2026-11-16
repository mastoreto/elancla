/** biome-ignore-all assist/source/organizeImports: <false positive> */
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import icon from 'astro-icon';

import react from '@astrojs/react';

import node from '@astrojs/node';

import { config as loadEnv } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carga el .env raíz del monorepo (donde vive DATABASE_URL) para que getSiteConfig()
// lea la BD en `astro dev` y en el build. No sobreescribe lo ya inyectado (p. ej. en
// Docker). En el server SSR de producción, ver el script `start` (node --env-file).
loadEnv({ path: resolve(__dirname, '../../.env') });

const SITE_URL = 'https://elancla.uy';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // SSR: el estado del sitio (online/maintenance/closed) se lee por request
  // desde la BD, así el cambio del admin se refleja al instante sin rebuild.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-UY',
          pt: 'pt-BR',
          en: 'en-US',
        },
      },
      filter: (page) => {
        // Excluir alias con caracteres no normalizados (ej. ñ → %C3%B1).
        if (/%[0-9A-F]{2}/i.test(page)) return false;
        // Excluir páginas marcadas noindex.
        if (page.endsWith('/ministerios/sobre-nosotros')) return false;
        return true;
      },
      serialize(item) {
        if (item.url === `${SITE_URL}/`) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/ministerios/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/confesion-de-fe')) {
          item.priority = 0.8;
          item.changefreq = 'yearly';
        }
        return item;
      },
    }),
    icon(),
    react({
      // Configuración para compatibilidad con React 19
      experimentalReactChildren: true,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@ancla/utils': resolve(__dirname, '../../packages/utils/src'),
        '@ancla/content': resolve(
          __dirname,
          '../../packages/content/src'
        ),
        '@ancla/db': resolve(__dirname, '../../packages/db/src'),
      },
    },
    plugins: [tailwindcss()],
    // SSR: empaquetamos los paquetes workspace (TS) para que getSiteConfig()
    // funcione en runtime y lea el estado del sitio en vivo. Solo @prisma/client
    // queda externo porque trae el engine nativo (.node) que no se puede bundlear.
    ssr: {
      external: ['@prisma/client'],
      noExternal: ['@ancla/db', '@ancla/content', '@ancla/utils'],
    },
    optimizeDeps: {
      exclude: ['@prisma/client'],
      esbuildOptions: {
        supported: {
          bigint: true,
        },
      },
    },
  },
  // Astro 6.0 optimizations
  image: {
    // Configuración mejorada para imágenes en Astro 6.0
    remotePatterns: [{ protocol: 'https' }],
  },
  // Mejorar manejo de assets estáticos
  build: {
    assets: 'assets',
  },
});
