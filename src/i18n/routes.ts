// src/i18n/routes.ts
// Maps a logical page key to its localized path per language.
// The language switcher uses this to jump to the equivalent page.
import type { Lang } from './types';

export type PageKey = 'home' | 'about' | 'team' | 'contact' | 'privacy';

export const routeMap: Record<PageKey, Record<Lang, string>> = {
  home:    { it: '/',           en: '/en/' },
  about:   { it: '/chi-siamo',  en: '/en/about' },
  team:    { it: '/team',       en: '/en/team' },
  contact: { it: '/contatti',   en: '/en/contact' },
  privacy: { it: '/privacy',    en: '/en/privacy' },
};

// Product pages share a localized prefix; the slug comes from the dictionary.
export const productBase: Record<Lang, string> = {
  it: '/prodotti',
  en: '/en/products',
};
