import { defineConfig } from 'astro/config';
import path from 'path';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [sitemap(), icon(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
