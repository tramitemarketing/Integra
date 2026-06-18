// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO-PLACEHOLDER: replace with the real Aruba domain before deploy.
const SITE = 'https://www.integra.example';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'it',
        locales: { it: 'it-IT', en: 'en-US' },
      },
    }),
  ],
});
