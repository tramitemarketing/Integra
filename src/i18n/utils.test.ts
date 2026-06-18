import { describe, it, expect } from 'vitest';
import { getLangFromUrl, switchLocalePath, useTranslations } from './utils';

describe('getLangFromUrl', () => {
  it('returns en for /en/ paths', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/about'))).toBe('en');
  });
  it('returns it for unprefixed paths', () => {
    expect(getLangFromUrl(new URL('https://x.com/chi-siamo'))).toBe('it');
  });
  it('returns it for root path', () => {
    expect(getLangFromUrl(new URL('https://x.com/'))).toBe('it');
  });
});

describe('switchLocalePath', () => {
  it('maps an IT page path to its EN equivalent', () => {
    expect(switchLocalePath('/chi-siamo', 'it', 'en')).toBe('/en/about');
  });
  it('maps an EN page path back to IT', () => {
    expect(switchLocalePath('/en/contact', 'en', 'it')).toBe('/contatti');
  });
  it('falls back to the target home when no mapping exists', () => {
    expect(switchLocalePath('/prodotti/some-unknown', 'it', 'en')).toBe('/en/');
  });
  it('keeps home mapping', () => {
    expect(switchLocalePath('/', 'it', 'en')).toBe('/en/');
  });
  it('maps trailing-slash EN home to IT home', () => {
    expect(switchLocalePath('/en/', 'en', 'it')).toBe('/');
  });
  it('maps IT product page to EN equivalent by slug index', () => {
    expect(switchLocalePath('/prodotti/prodotto-1', 'it', 'en')).toBe('/en/products/product-1');
  });
  it('maps EN product page to IT equivalent by slug index', () => {
    expect(switchLocalePath('/en/products/product-2', 'en', 'it')).toBe('/prodotti/prodotto-2');
  });
});

describe('useTranslations', () => {
  it('returns the correct dictionary for the given language', () => {
    expect(useTranslations('it').nav.about).toBe('Chi siamo');
  });
});
