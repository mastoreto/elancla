/** biome-ignore-all assist/source/organizeImports: <false positive> */
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    sitemap(),
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
