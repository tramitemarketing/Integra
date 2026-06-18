// src/i18n/utils.ts
import type { Lang, Dictionary } from './types';
import { routeMap, productBase, type PageKey } from './routes';
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
 * Resolution order:
 *   1. Exact page map (home, about, team, contact).
 *   2. Product slug map: if `currentPath` is under the localized product base,
 *      find the product by slug index and return the equivalent slug in `to`.
 *   3. Home fallback for any unrecognised path.
 */
export function switchLocalePath(currentPath: string, from: Lang, to: Lang): string {
  const cur = norm(currentPath);

  // 1. Exact page mapping
  for (const key of Object.keys(routeMap) as PageKey[]) {
    if (norm(routeMap[key][from]) === cur) return routeMap[key][to];
  }

  // 2. Product slug mapping
  const fromBase = productBase[from];
  if (cur.startsWith(fromBase + '/')) {
    const slug = cur.slice(fromBase.length + 1);
    const index = dictionaries[from].products.findIndex(p => p.slug === slug);
    if (index !== -1) {
      return `${productBase[to]}/${dictionaries[to].products[index].slug}`;
    }
  }

  // 3. Home fallback
  return routeMap.home[to];
}
