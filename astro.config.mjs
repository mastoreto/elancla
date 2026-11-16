/** biome-ignore-all assist/source/organizeImports: <false positive> */
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

import react from '@astrojs/react';

const SITE_URL = 'https://elancla.uy';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
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
    plugins: [tailwindcss()],
    optimizeDeps: {
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
