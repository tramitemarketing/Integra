import { describe, it, expect } from 'vitest';
import { getLangFromUrl, switchLocalePath } from './utils';

describe('getLangFromUrl', () => {
  it('returns en for /en/ paths', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/about'))).toBe('en');
  });
  it('returns it for unprefixed paths', () => {
    expect(getLangFromUrl(new URL('https://x.com/chi-siamo'))).toBe('it');
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
});
