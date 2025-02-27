import { defineConfig } from 'astro/config';
import path from 'path';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [tailwind(), sitemap(), icon(), react()],
});