import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://torrancewatch.org',
  output: 'static',
  adapter: cloudflare(),
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: { format: 'file' },
});
