/** biome-ignore-all assist/source/organizeImports: <false positive> */
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

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
  // Vercel sets VERCEL=1 at build time and needs its own adapter (Build Output API);
  // everywhere else (Docker, local) we keep the standalone Node server.
  adapter: process.env.VERCEL ? vercel() : node({ mode: 'standalone' }),
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
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
