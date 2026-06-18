// src/i18n/utils.ts
import type { Lang, Dictionary } from './types';
import { routeMap, type PageKey } from './routes';
import { it } from './it';
import { en } from './en';

const dictionaries: Record<Lang, Dictionary> = { it, en };

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  return seg === 'en' ? 'en' : 'it';
}

export function useTranslations(lang: Lang): Dictionary {
  return dictionaries[lang];
}

/** Normalize a path for comparison (strip trailing slash except root). */
function norm(path: string): string {
  if (path === '/' ) return '/';
  return path.replace(/\/+$/, '');
}

/**
 * Given the current path and its language, return the equivalent path in `to`.
 * Uses the route-map; for product pages, maps the localized base and keeps the slug.
 * Falls back to the target home if no equivalent is found.
 */
export function switchLocalePath(currentPath: string, from: Lang, to: Lang): string {
  const cur = norm(currentPath);

  // exact page mapping
  for (const key of Object.keys(routeMap) as PageKey[]) {
    if (norm(routeMap[key][from]) === cur) return routeMap[key][to];
  }
  return routeMap.home[to];
}
