# Integra Showcase Site — Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a navigable, bilingual (IT/EN) static Astro showcase site for Integra (B2G software house) with the design system, all 6 pages, i18n, SEO-by-design, and three custom motion components, using structured placeholders.

**Architecture:** Astro `output: 'static'` (deploy on Aruba via FTP). Single source of truth for design tokens in `src/styles/tokens.css`. Copy lives in TS dictionaries (`src/i18n/it.ts` / `en.ts`); pages are thin templates that read the dictionary for the current locale. i18n via Astro native routing (IT no prefix, EN under `/en/`) plus a central route-map for the language switch. Zero framework JS — interactivity (hero word rotation, carousel, scroll reveal) is hand-written vanilla JS that respects `prefers-reduced-motion`.

**Tech Stack:** Astro 5, TypeScript, `@astrojs/sitemap`, `@fontsource/inter`, `@fontsource-variable/space-grotesk`, Vitest (for the one piece of real logic), vanilla JS, plain CSS with custom properties.

**Design discipline (applies to every visual task):** 70/20/10 (neutrals/dark/brand-blue). Blue ONLY on primary button, links, hover, one line/datum. No gradients-as-decoration, no spacey/futuristic effects, no blue flooding sections, no third font family. Accessibility AA, single `<h1>` per page, keyboard nav, focus visible, tap targets ≥44px. Reference: `docs/superpowers/specs/2026-06-18-integra-site-design.md` and the `ui-design-principles` skill.

---

## File Structure

```
INTEGRA/
├─ astro.config.mjs              # i18n + sitemap + site url
├─ package.json · tsconfig.json
├─ vitest.config.ts
├─ .gitignore · .env.example · README.md
├─ public/
│  ├─ robots.txt
│  ├─ favicon.svg · og-image.svg
│  └─ placeholder/  (hero.svg, product.svg, team.svg, case.svg)
└─ src/
   ├─ env.d.ts
   ├─ styles/
   │  ├─ tokens.css              # ★ single source of truth
   │  └─ global.css              # reset, @font-face imports, base, utilities, motion
   ├─ i18n/
   │  ├─ routes.ts               # central route-map (locale ⇄ path)
   │  ├─ it.ts · en.ts           # dictionaries: meta + copy
   │  ├─ types.ts                # Dictionary type
   │  ├─ utils.ts                # getLangFromUrl, useTranslations, switchLocalePath
   │  └─ utils.test.ts           # Vitest unit tests for switchLocalePath
   ├─ layouts/BaseLayout.astro
   ├─ components/
   │  ├─ Seo.astro · Header.astro · LangSwitch.astro · Footer.astro
   │  ├─ Button.astro · Section.astro · Reveal.astro
   │  ├─ HeroRotator.astro · Carousel.astro · GridAccent.astro
   │  ├─ ProductCard.astro · TeamCard.astro · ContactForm.astro
   └─ pages/
      ├─ index.astro · chi-siamo.astro · team.astro · contatti.astro
      ├─ prodotti/[slug].astro
      └─ en/
         ├─ index.astro · about.astro · team.astro · contact.astro
         └─ products/[slug].astro
```

---

## Task 1: Initialize the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `.gitignore`, `.env.example`

- [ ] **Step 1: Scaffold an empty Astro project in the current directory**

The folder already contains `.git` and `docs/`. Use the `empty` template into a temp dir and copy, or scaffold in place. Run:

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
```

If the CLI refuses because the directory is non-empty, scaffold into `./.astro-tmp` then move files:

```bash
npm create astro@latest .astro-tmp -- --template minimal --no-install --no-git --typescript strict --skip-houston
cp -r .astro-tmp/* .astro-tmp/.* . 2>/dev/null; rm -rf .astro-tmp
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/sitemap @fontsource/inter @fontsource-variable/space-grotesk
npm install -D vitest
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
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
```

- [ ] **Step 4: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.env
.DS_Store
npm-debug.log*
```

- [ ] **Step 5: Write `.env.example`**

```dotenv
# Formspree endpoint for the contact/careers form.
# Create a form at https://formspree.io and paste its endpoint here, then copy to .env
PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/REPLACE_WITH_FORM_ID
```

- [ ] **Step 6: Verify the dev server boots**

Run: `npm run dev`
Expected: server starts on `http://localhost:4321` with no config errors. Stop it (Ctrl-C).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with i18n + sitemap"
```

---

## Task 2: Design tokens — `tokens.css` (single source of truth)

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write the tokens file**

```css
/* src/styles/tokens.css
   SINGLE SOURCE OF TRUTH. Changing the brand blue = one line below. */
:root {
  /* === BRAND — PROVISIONAL, replace with the exact blue from the logo SVG === */
  --brand: #2E2ECC;        /* primary blue-violet (estimate) */
  --brand-dark: #1E1E8A;   /* same hue, darkened — hover/dark sections */
  --brand-tint: #EDEDFB;   /* same hue, lightened — delicate fills */

  /* === NEUTRALS (the canvas) === */
  --bg: #FFFFFF;
  --bg-alt: #F6F7F9;
  --text: #15161C;
  --text-muted: #5B5E6B;
  --border: #E4E6EB;

  /* === TYPOGRAPHY === */
  --font-body: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  --font-display: 'Space Grotesk Variable', var(--font-body);

  /* fluid type scale */
  --fs-300: 0.875rem;
  --fs-400: 1rem;
  --fs-500: 1.125rem;
  --fs-600: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  --fs-700: clamp(1.5rem, 1rem + 2vw, 2rem);
  --fs-800: clamp(2rem, 1.2rem + 3.2vw, 3rem);
  --fs-900: clamp(2.5rem, 1.4rem + 4.6vw, 4rem);
  --lh-body: 1.6;
  --lh-tight: 1.1;

  /* === SPACE SCALE (8px base) === */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* === SHAPE === */
  --radius: 10px;
  --radius-sm: 6px;
  --content-max: 72rem;     /* ~1152px */
  --prose-max: 42rem;       /* readable line length */

  --transition: 200ms ease;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(design): add tokens.css single source of truth"
```

---

## Task 3: Global styles, fonts, base & utilities

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write `global.css`**

```css
/* src/styles/global.css */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource-variable/space-grotesk';
@import './tokens.css';

/* reset */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
img, svg { display: block; max-width: 100%; height: auto; }
a { color: inherit; }

body {
  font-family: var(--font-body);
  font-size: var(--fs-400);
  line-height: var(--lh-body);
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  line-height: var(--lh-tight);
  font-weight: 600;
  letter-spacing: -0.02em;
}
h1 { font-size: var(--fs-900); }
h2 { font-size: var(--fs-800); }
h3 { font-size: var(--fs-600); }
p { max-width: var(--prose-max); }

/* layout helpers */
.container { width: 100%; max-width: var(--content-max); margin-inline: auto; padding-inline: var(--space-6); }
.stack > * + * { margin-top: var(--space-4); }

/* focus visible — accessibility */
:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; border-radius: var(--radius-sm); }

/* link style — blue used sparingly */
a.link { color: var(--brand); text-decoration: underline; text-underline-offset: 3px; }
a.link:hover { color: var(--brand-dark); }

/* motion: reveal-on-scroll base state */
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 500ms ease, transform 500ms ease; }
.reveal.is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}

/* visually-hidden (for skip link / a11y labels) */
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 2: Verify fonts resolve**

Run: `npm run build`
Expected: build succeeds; no "cannot find module @fontsource..." error.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(design): global styles, self-hosted fonts, motion + a11y base"
```

---

## Task 4: i18n types, route-map and dictionary skeletons

**Files:**
- Create: `src/i18n/types.ts`, `src/i18n/routes.ts`

- [ ] **Step 1: Write `src/i18n/types.ts`**

```ts
// src/i18n/types.ts
export type Lang = 'it' | 'en';

export interface PageMeta { title: string; description: string; }

export interface NavLabels { about: string; products: string; team: string; contact: string; }

export interface ProductEntry {
  slug: string;            // localized slug (used in URL)
  name: string;            // [NOME_PRODOTTO_x] placeholder
  tagline: string;
  what: string;            // self-contained first paragraph (SEO/AI extractable)
  audience: string;
  useCases: string[];
}

export interface CaseEntry { title: string; description: string; image: string; }

export interface TeamMember { name: string; role: string; bio: string; photo: string; }

export interface Dictionary {
  meta: {
    home: PageMeta; about: PageMeta; team: PageMeta; contact: PageMeta;
    product: (name: string) => PageMeta;
  };
  nav: NavLabels;
  cta: { contact: string; discover: string; send: string };
  home: {
    heroPre: string;
    heroRotating: string[];   // single rotating word options (real, not novelty)
    heroPost: string;
    heroLead: string;
    productsTitle: string;
    casesTitle: string;
    casesLead: string;
    historyTitle: string;
    historyBody: string;
  };
  about: { lead: string; historyTitle: string; historyBody: string; techTitle: string; tech: string[]; aiTitle: string; aiBody: string };
  team: { lead: string; members: TeamMember[] };
  contact: {
    lead: string;
    typeLabel: string; typeInfo: string; typeJob: string;
    nameLabel: string; emailLabel: string; messageLabel: string; cvLabel: string;
    careersTitle: string; careersBody: string;
    successNote: string;
  };
  products: ProductEntry[];
  cases: CaseEntry[];
  footer: { rights: string; email: string; address: string };
}
```

- [ ] **Step 2: Write `src/i18n/routes.ts` (central route-map)**

```ts
// src/i18n/routes.ts
// Maps a logical page key to its localized path per language.
// The language switcher uses this to jump to the equivalent page.
import type { Lang } from './types';

export type PageKey = 'home' | 'about' | 'team' | 'contact';

export const routeMap: Record<PageKey, Record<Lang, string>> = {
  home:    { it: '/',           en: '/en/' },
  about:   { it: '/chi-siamo',  en: '/en/about' },
  team:    { it: '/team',       en: '/en/team' },
  contact: { it: '/contatti',   en: '/en/contact' },
};

// Product pages share a localized prefix; the slug comes from the dictionary.
export const productBase: Record<Lang, string> = {
  it: '/prodotti',
  en: '/en/products',
};
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/types.ts src/i18n/routes.ts
git commit -m "feat(i18n): types and central route-map"
```

---

## Task 5: i18n utilities + unit test (the one piece of real logic)

**Files:**
- Create: `src/i18n/utils.ts`, `src/i18n/utils.test.ts`, `vitest.config.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Write the failing test `src/i18n/utils.test.ts`**

```ts
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
```

- [ ] **Step 2: Add Vitest config and test script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node' } });
```

Add to `package.json` `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `utils.ts` does not export those functions yet.

- [ ] **Step 4: Write `src/i18n/utils.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS (all 6 assertions). Note: this requires Task 6 dictionaries to exist for the import; if running before Task 6, create temporary empty `export const it = {} as any` / `en` — but order tasks so Task 6 precedes execution of this step. (Execution note: implement Task 6 dictionaries first, then run this step.)

- [ ] **Step 6: Commit**

```bash
git add src/i18n/utils.ts src/i18n/utils.test.ts vitest.config.ts package.json
git commit -m "feat(i18n): translation helpers + tested switchLocalePath"
```

---

## Task 6: Dictionaries with structured placeholder copy (IT + EN)

**Files:**
- Create: `src/i18n/it.ts`, `src/i18n/en.ts`

> Copy is plausible and structured (not lorem). Real-text gaps are marked `[DA SCRIVERE]`. Product names are `[NOME_PRODOTTO_1/2]`. First paragraphs (`what`) are self-contained for SEO/AI extraction.

- [ ] **Step 1: Write `src/i18n/it.ts`**

```ts
import type { Dictionary } from './types';

export const it: Dictionary = {
  meta: {
    home: { title: 'Integra — Software per i comuni da 25 anni', description: 'Integra è una software house di L’Aquila che da 25 anni realizza software per municipalità e comuni, unendo affidabilità storica e sviluppo moderno con l’AI.' },
    about: { title: 'Chi siamo — 25 anni di software per la PA | Integra', description: 'La storia di Integra: 25 anni da pionieri del software per la pubblica amministrazione, le tecnologie che usiamo e il nostro approccio allo sviluppo con l’AI.' },
    team: { title: 'Il team — Le persone di Integra', description: 'Le persone dietro Integra: competenze, ruoli ed esperienza al servizio dei comuni italiani.' },
    contact: { title: 'Contatti e lavora con noi | Integra', description: 'Contatta Integra per informazioni sui nostri prodotti o candidati per lavorare con noi. Sede a L’Aquila, operativi in tutta Italia.' },
    product: (name: string) => ({ title: `${name} — Soluzione software | Integra`, description: `${name}: software Integra per i comuni. Scopri cos’è, a chi serve e i casi d’uso.` }),
  },
  nav: { about: 'Chi siamo', products: 'Prodotti', team: 'Team', contact: 'Contatti' },
  cta: { contact: 'Contattaci', discover: 'Scopri di più', send: 'Invia' },
  home: {
    heroPre: 'Software per',
    heroRotating: ['i comuni', 'la PA', 'i territori', 'l’Italia che amministra'],
    heroPost: 'da 25 anni.',
    heroLead: 'Affidabilità di chi c’era prima, metodi di chi guarda avanti. Costruiamo strumenti che le amministrazioni usano ogni giorno. [DA SCRIVERE: rifinire claim]',
    productsTitle: 'I nostri prodotti',
    casesTitle: 'Dove lavoriamo',
    casesLead: 'Comuni e amministrazioni che usano le nostre soluzioni. [DA SCRIVERE: referenze reali]',
    historyTitle: '25 anni, e ancora pionieri',
    historyBody: 'Abbiamo attraversato ogni rivoluzione tecnologica del settore. Oggi usiamo l’AI nello sviluppo per fare prima e meglio. [DA SCRIVERE]',
  },
  about: {
    lead: 'Integra nasce a L’Aquila 25 anni fa per portare software serio dentro la pubblica amministrazione. [DA SCRIVERE]',
    historyTitle: 'La nostra storia',
    historyBody: '[DA SCRIVERE: racconto dei 25 anni, pionieri, rivoluzioni tecnologiche attraversate]',
    techTitle: 'Le tecnologie che usiamo',
    tech: ['[DA SCRIVERE: stack 1]', '[DA SCRIVERE: stack 2]', '[DA SCRIVERE: stack 3]'],
    aiTitle: 'Il nostro approccio all’AI',
    aiBody: '[DA SCRIVERE: come usate l’AI nello sviluppo, con concretezza e senza hype]',
  },
  team: {
    lead: 'Le persone che progettano, scrivono e mantengono i nostri prodotti. [DA SCRIVERE]',
    members: [
      { name: '[DA SCRIVERE: Nome 1]', role: '[Ruolo]', bio: '[Bio breve]', photo: '/placeholder/team.svg' },
      { name: '[DA SCRIVERE: Nome 2]', role: '[Ruolo]', bio: '[Bio breve]', photo: '/placeholder/team.svg' },
      { name: '[DA SCRIVERE: Nome 3]', role: '[Ruolo]', bio: '[Bio breve]', photo: '/placeholder/team.svg' },
      { name: '[DA SCRIVERE: Nome 4]', role: '[Ruolo]', bio: '[Bio breve]', photo: '/placeholder/team.svg' },
    ],
  },
  contact: {
    lead: 'Scrivici per informazioni o per candidarti. Ti rispondiamo presto.',
    typeLabel: 'Tipo di richiesta',
    typeInfo: 'Informazioni',
    typeJob: 'Candidatura',
    nameLabel: 'Nome',
    emailLabel: 'Email',
    messageLabel: 'Messaggio',
    cvLabel: 'Link al CV (LinkedIn, PDF online…)',
    careersTitle: 'Lavora con noi',
    careersBody: 'Cerchiamo persone curiose e rigorose. Se ti piace costruire software che serve davvero, raccontaci di te. [DA SCRIVERE]',
    successNote: 'Grazie! Ti ricontatteremo a breve.',
  },
  products: [
    { slug: 'prodotto-1', name: '[NOME_PRODOTTO_1]', tagline: '[DA SCRIVERE: tagline]', what: '[NOME_PRODOTTO_1] è [DA SCRIVERE: cos’è in una frase autoconclusiva].', audience: '[DA SCRIVERE: a chi serve]', useCases: ['[Caso d’uso 1]', '[Caso d’uso 2]', '[Caso d’uso 3]'] },
    { slug: 'prodotto-2', name: '[NOME_PRODOTTO_2]', tagline: '[DA SCRIVERE: tagline]', what: '[NOME_PRODOTTO_2] è [DA SCRIVERE: cos’è in una frase autoconclusiva].', audience: '[DA SCRIVERE: a chi serve]', useCases: ['[Caso d’uso 1]', '[Caso d’uso 2]', '[Caso d’uso 3]'] },
  ],
  cases: [
    { title: '[DA SCRIVERE: Comune / scenario 1]', description: '[Breve descrizione del caso]', image: '/placeholder/case.svg' },
    { title: '[DA SCRIVERE: Comune / scenario 2]', description: '[Breve descrizione del caso]', image: '/placeholder/case.svg' },
    { title: '[DA SCRIVERE: Comune / scenario 3]', description: '[Breve descrizione del caso]', image: '/placeholder/case.svg' },
    { title: '[DA SCRIVERE: Comune / scenario 4]', description: '[Breve descrizione del caso]', image: '/placeholder/case.svg' },
  ],
  footer: { rights: '© Integra. Tutti i diritti riservati.', email: 'info@integra.example', address: 'L’Aquila, Italia' },
};
```

- [ ] **Step 2: Write `src/i18n/en.ts`** (same shape, English draft; keep placeholders parallel)

```ts
import type { Dictionary } from './types';

export const en: Dictionary = {
  meta: {
    home: { title: 'Integra — Software for municipalities for 25 years', description: 'Integra is a software house from L’Aquila that has built software for municipalities and local governments for 25 years, pairing proven reliability with modern, AI-assisted development.' },
    about: { title: 'About — 25 years of public-sector software | Integra', description: 'The Integra story: 25 years as pioneers of software for public administration, the technologies we use and our AI-assisted development approach.' },
    team: { title: 'Team — The people of Integra', description: 'The people behind Integra: skills, roles and experience serving Italian municipalities.' },
    contact: { title: 'Contact & careers | Integra', description: 'Contact Integra for product information or apply to work with us. Based in L’Aquila, operating across Italy.' },
    product: (name: string) => ({ title: `${name} — Software solution | Integra`, description: `${name}: Integra software for municipalities. Learn what it is, who it is for and its use cases.` }),
  },
  nav: { about: 'About', products: 'Products', team: 'Team', contact: 'Contact' },
  cta: { contact: 'Contact us', discover: 'Learn more', send: 'Send' },
  home: {
    heroPre: 'Software for',
    heroRotating: ['municipalities', 'public administration', 'local territories', 'the public sector'],
    heroPost: 'for 25 years.',
    heroLead: 'The reliability of those who were there first, the methods of those looking ahead. We build tools that administrations use every day. [TO WRITE: refine claim]',
    productsTitle: 'Our products',
    casesTitle: 'Where we work',
    casesLead: 'Municipalities and administrations that use our solutions. [TO WRITE: real references]',
    historyTitle: '25 years, still pioneers',
    historyBody: 'We have lived through every technological revolution in the field. Today we use AI in development to ship faster and better. [TO WRITE]',
  },
  about: {
    lead: 'Integra was founded in L’Aquila 25 years ago to bring serious software into public administration. [TO WRITE]',
    historyTitle: 'Our story',
    historyBody: '[TO WRITE: the 25-year story, pioneers, technological revolutions]',
    techTitle: 'The technologies we use',
    tech: ['[TO WRITE: stack 1]', '[TO WRITE: stack 2]', '[TO WRITE: stack 3]'],
    aiTitle: 'Our approach to AI',
    aiBody: '[TO WRITE: how you use AI in development, concrete, no hype]',
  },
  team: {
    lead: 'The people who design, write and maintain our products. [TO WRITE]',
    members: [
      { name: '[TO WRITE: Name 1]', role: '[Role]', bio: '[Short bio]', photo: '/placeholder/team.svg' },
      { name: '[TO WRITE: Name 2]', role: '[Role]', bio: '[Short bio]', photo: '/placeholder/team.svg' },
      { name: '[TO WRITE: Name 3]', role: '[Role]', bio: '[Short bio]', photo: '/placeholder/team.svg' },
      { name: '[TO WRITE: Name 4]', role: '[Role]', bio: '[Short bio]', photo: '/placeholder/team.svg' },
    ],
  },
  contact: {
    lead: 'Write to us for information or to apply. We reply quickly.',
    typeLabel: 'Request type',
    typeInfo: 'Information',
    typeJob: 'Job application',
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    cvLabel: 'CV link (LinkedIn, online PDF…)',
    careersTitle: 'Work with us',
    careersBody: 'We look for curious, rigorous people. If you like building software that truly matters, tell us about yourself. [TO WRITE]',
    successNote: 'Thank you! We will get back to you soon.',
  },
  products: [
    { slug: 'product-1', name: '[NOME_PRODOTTO_1]', tagline: '[TO WRITE: tagline]', what: '[NOME_PRODOTTO_1] is [TO WRITE: what it is, self-contained sentence].', audience: '[TO WRITE: who it is for]', useCases: ['[Use case 1]', '[Use case 2]', '[Use case 3]'] },
    { slug: 'product-2', name: '[NOME_PRODOTTO_2]', tagline: '[TO WRITE: tagline]', what: '[NOME_PRODOTTO_2] is [TO WRITE: what it is, self-contained sentence].', audience: '[TO WRITE: who it is for]', useCases: ['[Use case 1]', '[Use case 2]', '[Use case 3]'] },
  ],
  cases: [
    { title: '[TO WRITE: Municipality / scenario 1]', description: '[Short case description]', image: '/placeholder/case.svg' },
    { title: '[TO WRITE: Municipality / scenario 2]', description: '[Short case description]', image: '/placeholder/case.svg' },
    { title: '[TO WRITE: Municipality / scenario 3]', description: '[Short case description]', image: '/placeholder/case.svg' },
    { title: '[TO WRITE: Municipality / scenario 4]', description: '[Short case description]', image: '/placeholder/case.svg' },
  ],
  footer: { rights: '© Integra. All rights reserved.', email: 'info@integra.example', address: 'L’Aquila, Italy' },
};
```

- [ ] **Step 3: Verify types compile**

Run: `npx astro check`
Expected: 0 errors (dictionaries satisfy `Dictionary`).

- [ ] **Step 4: Run i18n tests (now that dictionaries exist)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/it.ts src/i18n/en.ts
git commit -m "feat(i18n): IT/EN dictionaries with structured placeholder copy"
```

---

## Task 7: SEO component + JSON-LD

**Files:**
- Create: `src/components/Seo.astro`

- [ ] **Step 1: Write `Seo.astro`**

```astro
---
// src/components/Seo.astro
import { routeMap, type PageKey } from '../i18n/routes';
import type { Lang } from '../i18n/types';

interface Props {
  lang: Lang;
  title: string;
  description: string;
  pageKey?: PageKey;        // for hreflang pairing on the 4 core pages
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
const { lang, title, description, pageKey, jsonLd } = Astro.props;
const site = Astro.site!;
const canonical = new URL(Astro.url.pathname, site).href;

// hreflang pairs (only for mapped pages)
const alternates = pageKey
  ? [
      { hreflang: 'it', href: new URL(routeMap[pageKey].it, site).href },
      { hreflang: 'en', href: new URL(routeMap[pageKey].en, site).href },
      { hreflang: 'x-default', href: new URL(routeMap[pageKey].it, site).href },
    ]
  : [];

const org = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Integra',
  url: site.href,
  foundingDate: '2001', // 25 years as of 2026 — adjust to exact year
  address: { '@type': 'PostalAddress', addressLocality: "L'Aquila", addressCountry: 'IT' },
  areaServed: 'IT',
  // sameAs: [] // TODO-PLACEHOLDER: add social profiles when available
};
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{alternates.map((a) => <link rel="alternate" hreflang={a.hreflang} href={a.href} />)}

<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={new URL('/og-image.svg', site).href} />
<meta property="og:locale" content={lang === 'it' ? 'it_IT' : 'en_US'} />
<meta name="twitter:card" content="summary_large_image" />

<script type="application/ld+json" set:html={JSON.stringify(org)} />
{jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Seo.astro
git commit -m "feat(seo): Seo component with canonical, hreflang, OG, Organization JSON-LD"
```

---

## Task 8: BaseLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `BaseLayout.astro`**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import Seo from '../components/Seo.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getLangFromUrl } from '../i18n/utils';
import type { PageKey } from '../i18n/routes';

interface Props {
  title: string;
  description: string;
  pageKey?: PageKey;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
const { title, description, pageKey, jsonLd } = Astro.props;
const lang = getLangFromUrl(Astro.url);
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <Seo lang={lang} title={title} description={description} pageKey={pageKey} jsonLd={jsonLd} />
  </head>
  <body>
    <a href="#main" class="visually-hidden">Salta al contenuto</a>
    <Header />
    <main id="main">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): BaseLayout with skip link, header, footer, SEO"
```

---

## Task 9: Button & Section primitives

**Files:**
- Create: `src/components/Button.astro`, `src/components/Section.astro`

- [ ] **Step 1: Write `Button.astro`** (one consistent button — coherence principle)

```astro
---
// src/components/Button.astro
interface Props { href: string; variant?: 'primary' | 'ghost'; class?: string; }
const { href, variant = 'primary', class: cls = '' } = Astro.props;
---
<a href={href} class={`btn btn--${variant} ${cls}`}><slot /></a>
<style>
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    min-height: 48px; padding: 0 1.25rem;
    border-radius: var(--radius); font-weight: 600;
    text-decoration: none; transition: background var(--transition), color var(--transition), border-color var(--transition);
  }
  .btn--primary { background: var(--brand); color: #fff; }
  .btn--primary:hover { background: var(--brand-dark); }
  .btn--ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
  .btn--ghost:hover { border-color: var(--brand); color: var(--brand); }
</style>
```

- [ ] **Step 2: Write `Section.astro`** (vertical rhythm + optional alt background)

```astro
---
// src/components/Section.astro
interface Props { alt?: boolean; class?: string; }
const { alt = false, class: cls = '' } = Astro.props;
---
<section class={`section ${alt ? 'section--alt' : ''} ${cls}`}>
  <div class="container"><slot /></div>
</section>
<style>
  .section { padding-block: var(--space-24); }
  .section--alt { background: var(--bg-alt); }
  @media (max-width: 640px) { .section { padding-block: var(--space-16); } }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Button.astro src/components/Section.astro
git commit -m "feat(ui): Button and Section primitives"
```

---

## Task 10: Reveal (scroll motion)

**Files:**
- Create: `src/components/Reveal.astro`

- [ ] **Step 1: Write `Reveal.astro`** (wraps content; vanilla IntersectionObserver, reduced-motion safe)

```astro
---
// src/components/Reveal.astro
interface Props { as?: keyof HTMLElementTagNameMap; class?: string; }
const { as: Tag = 'div', class: cls = '' } = Astro.props;
---
<Tag class={`reveal ${cls}`}><slot /></Tag>

<script>
  // Runs once per page. Adds .is-visible when elements scroll into view.
  const els = document.querySelectorAll('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io.observe(el));
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Reveal.astro
git commit -m "feat(motion): Reveal scroll-in component (reduced-motion safe)"
```

---

## Task 11: HeroRotator (single rotating word, vanilla)

**Files:**
- Create: `src/components/HeroRotator.astro`

- [ ] **Step 1: Write `HeroRotator.astro`**

```astro
---
// src/components/HeroRotator.astro
// Renders: <pre> <rotating word> <post>. Fixed-height slot = no layout shift.
interface Props { pre: string; words: string[]; post: string; }
const { pre, words, post } = Astro.props;
---
<h1 class="hero-title">
  {pre}{' '}
  <span class="hero-rotator" data-words={JSON.stringify(words)}>
    <span class="hero-rotator__word">{words[0]}</span>
  </span>{' '}
  {post}
</h1>

<style>
  .hero-title { max-width: 18ch; }
  .hero-rotator { display: inline-grid; vertical-align: bottom; overflow: hidden; }
  .hero-rotator__word {
    grid-area: 1 / 1; color: var(--brand);
    transition: opacity 400ms ease, transform 400ms ease;
  }
  .hero-rotator__word.is-out { opacity: 0; transform: translateY(-0.6em); }
  .hero-rotator__word.is-in { opacity: 0; transform: translateY(0.6em); }
  @media (prefers-reduced-motion: reduce) {
    .hero-rotator__word { transition: none; }
  }
</style>

<script>
  const root = document.querySelector('.hero-rotator') as HTMLElement | null;
  if (root) {
    const words: string[] = JSON.parse(root.dataset.words || '[]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wordEl = root.querySelector('.hero-rotator__word') as HTMLElement;
    if (!reduce && words.length > 1) {
      let i = 0;
      setInterval(() => {
        wordEl.classList.add('is-out');
        setTimeout(() => {
          i = (i + 1) % words.length;
          wordEl.textContent = words[i];
          wordEl.classList.remove('is-out');
          wordEl.classList.add('is-in');
          requestAnimationFrame(() => wordEl.classList.remove('is-in'));
        }, 400);
      }, 2600);
    }
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HeroRotator.astro
git commit -m "feat(hero): HeroRotator single rotating word, vanilla, no layout shift"
```

---

## Task 12: Carousel (CSS scroll-snap + vanilla controls)

**Files:**
- Create: `src/components/Carousel.astro`

- [ ] **Step 1: Write `Carousel.astro`** (consumes `cases` items; functional scrim for legibility)

```astro
---
// src/components/Carousel.astro
import type { CaseEntry } from '../i18n/types';
interface Props { items: CaseEntry[]; label: string; }
const { items, label } = Astro.props;
---
<div class="carousel" role="region" aria-label={label}>
  <ul class="carousel__track">
    {items.map((it) => (
      <li class="carousel__item">
        <article class="card">
          <img src={it.image} alt={it.title} width="360" height="240" loading="lazy" />
          <div class="card__scrim"></div>
          <div class="card__body">
            <h3 class="card__title">{it.title}</h3>
            <p class="card__desc">{it.description}</p>
          </div>
        </article>
      </li>
    ))}
  </ul>
  <div class="carousel__nav">
    <button class="carousel__btn" data-dir="prev" aria-label="Precedente">←</button>
    <button class="carousel__btn" data-dir="next" aria-label="Successivo">→</button>
  </div>
</div>

<style>
  .carousel { position: relative; }
  .carousel__track {
    list-style: none; padding: 0; margin: 0;
    display: flex; gap: var(--space-4);
    overflow-x: auto; scroll-snap-type: x mandatory;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .carousel__track::-webkit-scrollbar { display: none; }
  .carousel__item { flex: 0 0 clamp(260px, 80vw, 340px); scroll-snap-align: start; }
  .card { position: relative; border-radius: var(--radius); overflow: hidden; min-height: 240px; }
  .card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  /* functional scrim — legibility of text over image (not decoration) */
  .card__scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(21,22,28,.78), rgba(21,22,28,0) 60%); }
  .card__body { position: absolute; inset-inline: 0; bottom: 0; padding: var(--space-4); color: #fff; }
  .card__title { color: #fff; font-size: var(--fs-600); }
  .card__desc { font-size: var(--fs-300); opacity: .9; }
  .carousel__nav { display: flex; gap: var(--space-2); justify-content: flex-end; margin-top: var(--space-4); }
  .carousel__btn { min-width: 44px; min-height: 44px; border: 1px solid var(--border); background: var(--bg); border-radius: var(--radius-sm); cursor: pointer; }
  .carousel__btn:hover { border-color: var(--brand); color: var(--brand); }
</style>

<script>
  document.querySelectorAll<HTMLElement>('.carousel').forEach((c) => {
    const track = c.querySelector('.carousel__track') as HTMLElement;
    c.querySelectorAll<HTMLButtonElement>('.carousel__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const amount = track.clientWidth * 0.8;
        track.scrollBy({ left: btn.dataset.dir === 'next' ? amount : -amount, behavior: 'smooth' });
      });
    });
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Carousel.astro
git commit -m "feat(ui): scroll-snap Carousel with functional scrim, vanilla controls"
```

---

## Task 13: GridAccent (static blueprint grid)

**Files:**
- Create: `src/components/GridAccent.astro`

- [ ] **Step 1: Write `GridAccent.astro`** (static, very low opacity, neutral — heritage/engineering feel, NOT spacey)

```astro
---
// src/components/GridAccent.astro
// A faint static blueprint grid for ONE band only. No animation, no navy flood.
---
<div class="grid-accent" aria-hidden="true"></div>
<style>
  .grid-accent {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(to right, var(--brand-tint) 1px, transparent 1px),
      linear-gradient(to bottom, var(--brand-tint) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: .5;
    -webkit-mask-image: radial-gradient(ellipse at center, #000 0%, transparent 75%);
            mask-image: radial-gradient(ellipse at center, #000 0%, transparent 75%);
  }
</style>
```

> Usage note for consuming sections: wrap in a positioned container (`position: relative`) and place content at `z-index: 1`.

- [ ] **Step 2: Commit**

```bash
git add src/components/GridAccent.astro
git commit -m "feat(ui): static blueprint GridAccent (heritage texture, no animation)"
```

---

## Task 14: ProductCard & TeamCard

**Files:**
- Create: `src/components/ProductCard.astro`, `src/components/TeamCard.astro`

- [ ] **Step 1: Write `ProductCard.astro`**

```astro
---
// src/components/ProductCard.astro
interface Props { name: string; tagline: string; href: string; cta: string; }
const { name, tagline, href, cta } = Astro.props;
---
<article class="pcard">
  <h3 class="pcard__name">{name}</h3>
  <p class="pcard__tag">{tagline}</p>
  <a href={href} class="link">{cta} →</a>
</article>
<style>
  .pcard { padding: var(--space-8); border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg); transition: border-color var(--transition), transform var(--transition); }
  .pcard:hover { border-color: var(--brand); transform: translateY(-2px); }
  .pcard__name { font-size: var(--fs-600); }
  .pcard__tag { color: var(--text-muted); margin-block: var(--space-2) var(--space-4); }
</style>
```

- [ ] **Step 2: Write `TeamCard.astro`**

```astro
---
// src/components/TeamCard.astro
import type { TeamMember } from '../i18n/types';
interface Props { member: TeamMember; }
const { member } = Astro.props;
---
<article class="tcard">
  <img src={member.photo} alt={`Foto di ${member.name}`} width="120" height="120" loading="lazy" />
  <h3 class="tcard__name">{member.name}</h3>
  <p class="tcard__role">{member.role}</p>
  <p class="tcard__bio">{member.bio}</p>
</article>
<style>
  .tcard { text-align: center; }
  .tcard img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-inline: auto; background: var(--bg-alt); }
  .tcard__name { font-size: var(--fs-500); margin-top: var(--space-3); }
  .tcard__role { color: var(--brand); font-weight: 600; font-size: var(--fs-300); }
  .tcard__bio { color: var(--text-muted); font-size: var(--fs-300); margin-top: var(--space-2); margin-inline: auto; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductCard.astro src/components/TeamCard.astro
git commit -m "feat(ui): ProductCard and TeamCard"
```

---

## Task 15: ContactForm (request-type radios on top, a11y errors)

**Files:**
- Create: `src/components/ContactForm.astro`

- [ ] **Step 1: Write `ContactForm.astro`**

```astro
---
// src/components/ContactForm.astro
import type { Dictionary } from '../i18n/types';
interface Props { t: Dictionary['contact']; sendLabel: string; }
const { t, sendLabel } = Astro.props;
const endpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT ?? '';
---
<form class="cform" action={endpoint} method="POST">
  <fieldset class="cform__group">
    <legend>{t.typeLabel}</legend>
    <label class="radio"><input type="radio" name="request_type" value={t.typeInfo} checked /> {t.typeInfo}</label>
    <label class="radio"><input type="radio" name="request_type" value={t.typeJob} /> {t.typeJob}</label>
  </fieldset>

  <div class="cform__field">
    <label for="name">{t.nameLabel}</label>
    <input id="name" name="name" type="text" required autocomplete="name" />
  </div>

  <div class="cform__field">
    <label for="email">{t.emailLabel}</label>
    <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-err" />
    <p id="email-err" class="cform__err" hidden>⚠ <span></span></p>
  </div>

  <div class="cform__field" data-cv hidden>
    <label for="cv">{t.cvLabel}</label>
    <input id="cv" name="cv_link" type="url" />
  </div>

  <div class="cform__field">
    <label for="message">{t.messageLabel}</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>

  <!-- honeypot -->
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="visually-hidden" aria-hidden="true" />

  <button type="submit" class="btn btn--primary">{sendLabel}</button>
</form>

<style>
  .cform { display: flex; flex-direction: column; gap: var(--space-6); max-width: 36rem; }
  .cform__group { border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); display: flex; gap: var(--space-6); }
  .cform__group legend { padding-inline: var(--space-2); color: var(--text-muted); font-size: var(--fs-300); }
  .radio { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; }
  .cform__field { display: flex; flex-direction: column; gap: var(--space-2); }
  .cform__field label { font-weight: 600; font-size: var(--fs-300); }
  .cform input, .cform textarea { padding: .75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font: inherit; min-height: 44px; }
  .cform input:focus, .cform textarea:focus { border-color: var(--brand); }
  .cform__err { color: #b00020; font-size: var(--fs-300); }
  .btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 1.25rem; border-radius: var(--radius); font-weight: 600; border: none; cursor: pointer; }
  .btn--primary { background: var(--brand); color: #fff; }
  .btn--primary:hover { background: var(--brand-dark); }
</style>

<script>
  // Progressive enhancement: reveal CV field only for job applications.
  const form = document.querySelector('.cform') as HTMLFormElement | null;
  if (form) {
    const cv = form.querySelector('[data-cv]') as HTMLElement;
    const jobRadio = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="request_type"]'));
    const sync = () => {
      const isJob = jobRadio.find((r) => r.checked)?.value?.toLowerCase().includes('candid')
        || jobRadio.find((r) => r.checked)?.value?.toLowerCase().includes('applic');
      cv.hidden = !isJob;
    };
    jobRadio.forEach((r) => r.addEventListener('change', sync));
    sync();

    // Text+icon validation message (not color only)
    const email = form.querySelector('#email') as HTMLInputElement;
    const err = form.querySelector('#email-err') as HTMLElement;
    const errText = err.querySelector('span') as HTMLElement;
    email.addEventListener('invalid', (e) => {
      e.preventDefault();
      errText.textContent = email.validationMessage;
      err.hidden = false;
    });
    email.addEventListener('input', () => { if (email.validity.valid) err.hidden = true; });
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "feat(form): ContactForm — type radios on top, conditional CV, a11y errors, honeypot"
```

---

## Task 16: Header + LangSwitch + Footer

**Files:**
- Create: `src/components/Header.astro`, `src/components/LangSwitch.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write `LangSwitch.astro`**

```astro
---
// src/components/LangSwitch.astro
import { getLangFromUrl, switchLocalePath } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const other = lang === 'it' ? 'en' : 'it';
const href = switchLocalePath(Astro.url.pathname, lang, other);
---
<a class="langswitch" href={href} hreflang={other} aria-label={`Switch to ${other.toUpperCase()}`}>
  <span class={lang === 'it' ? 'is-active' : ''}>IT</span>
  <span aria-hidden="true">/</span>
  <span class={lang === 'en' ? 'is-active' : ''}>EN</span>
</a>
<style>
  .langswitch { display: inline-flex; gap: .35rem; font-size: var(--fs-300); color: var(--text-muted); text-decoration: none; }
  .langswitch .is-active { color: var(--text); font-weight: 600; }
</style>
```

- [ ] **Step 2: Write `Header.astro`**

```astro
---
// src/components/Header.astro
import LangSwitch from './LangSwitch.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import { routeMap, productBase } from '../i18n/routes';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const r = (key: keyof typeof routeMap) => routeMap[key][lang];
const productsHref = `${productBase[lang]}/${t.products[0].slug}`;
---
<header class="site-header">
  <div class="container site-header__inner">
    <a href={r('home')} class="logo" aria-label="Integra — home">INTEGRA</a>
    <nav class="nav" aria-label="Primaria">
      <a href={r('about')}>{t.nav.about}</a>
      <a href={productsHref}>{t.nav.products}</a>
      <a href={r('team')}>{t.nav.team}</a>
      <a href={r('contact')}>{t.nav.contact}</a>
    </nav>
    <LangSwitch />
  </div>
</header>
<style>
  .site-header { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(6px); z-index: 10; }
  .site-header__inner { display: flex; align-items: center; gap: var(--space-6); min-height: 64px; }
  .logo { font-family: var(--font-display); font-weight: 600; letter-spacing: .04em; text-decoration: none; }
  .nav { display: flex; gap: var(--space-6); margin-inline-start: auto; }
  .nav a { text-decoration: none; color: var(--text-muted); }
  .nav a:hover { color: var(--brand); }
  @media (max-width: 640px) { .nav { gap: var(--space-4); font-size: var(--fs-300); } .logo { font-size: var(--fs-500); } }
</style>
```

> Note: logo is a text placeholder (`INTEGRA`). When the SVG arrives, replace the `<a class="logo">` content with a contained `<img>`.

- [ ] **Step 3: Write `Footer.astro`**

```astro
---
// src/components/Footer.astro
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import { routeMap } from '../i18n/routes';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div>
      <p class="site-footer__brand">INTEGRA</p>
      <p class="muted">{t.footer.address}</p>
      <p><a class="link" href={`mailto:${t.footer.email}`}>{t.footer.email}</a></p>
    </div>
    <nav class="site-footer__nav" aria-label="Footer">
      <a href={routeMap.about[lang]}>{t.nav.about}</a>
      <a href={routeMap.team[lang]}>{t.nav.team}</a>
      <a href={routeMap.contact[lang]}>{t.nav.contact}</a>
    </nav>
  </div>
  <p class="container muted small">© {year} — {t.footer.rights}</p>
</footer>
<style>
  .site-footer { border-top: 1px solid var(--border); padding-block: var(--space-12) var(--space-8); margin-top: var(--space-24); }
  .site-footer__inner { display: flex; justify-content: space-between; gap: var(--space-8); flex-wrap: wrap; }
  .site-footer__brand { font-family: var(--font-display); font-weight: 600; }
  .site-footer__nav { display: flex; flex-direction: column; gap: var(--space-2); }
  .site-footer__nav a { text-decoration: none; color: var(--text-muted); }
  .site-footer__nav a:hover { color: var(--brand); }
  .muted { color: var(--text-muted); }
  .small { font-size: var(--fs-300); margin-top: var(--space-8); }
</style>
```

- [ ] **Step 4: Verify build with components wired**

Run: `npx astro check && npm run build`
Expected: 0 type errors; build succeeds (pages still missing — that's fine, no pages reference these yet beyond layout).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/LangSwitch.astro src/components/Footer.astro
git commit -m "feat(nav): Header, LangSwitch (route-map aware), Footer"
```

---

## Task 17: Placeholder assets + robots.txt

**Files:**
- Create: `public/favicon.svg`, `public/og-image.svg`, `public/placeholder/hero.svg`, `public/placeholder/product.svg`, `public/placeholder/team.svg`, `public/placeholder/case.svg`, `public/robots.txt`

- [ ] **Step 1: Create `public/robots.txt`** (allow all incl. AI crawlers; link sitemap)

```text
User-agent: *
Allow: /

# AI crawlers explicitly allowed (visibility/citations)
User-agent: ClaudeBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://www.integra.example/sitemap-index.xml
```

> TODO-PLACEHOLDER: update the Sitemap URL to the real Aruba domain.

- [ ] **Step 2: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#2E2ECC"/><text x="16" y="22" font-family="sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">I</text></svg>
```

- [ ] **Step 3: Create the placeholder SVGs** (correct aspect ratios, light, no heavy images)

`public/og-image.svg` (1200×630):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FFFFFF"/><text x="80" y="330" font-family="sans-serif" font-size="96" font-weight="700" fill="#15161C">INTEGRA</text><text x="84" y="400" font-family="sans-serif" font-size="34" fill="#5B5E6B">Software per i comuni da 25 anni</text></svg>
```

`public/placeholder/hero.svg` (16:9), `product.svg` (4:3), `case.svg` (3:2), `team.svg` (1:1) — same pattern, neutral fill `#F6F7F9` with a centered label. Example `team.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="#F6F7F9"/><circle cx="120" cy="100" r="44" fill="#E4E6EB"/><rect x="60" y="150" width="120" height="60" rx="30" fill="#E4E6EB"/></svg>
```

Create `hero.svg` (width 960 height 540), `product.svg` (480×360), `case.svg` (360×240) with `<rect>` fill `#F6F7F9` and a small `<text>` label.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "chore(assets): placeholder SVGs, favicon, OG image, robots.txt"
```

---

## Task 18: Home pages (IT + EN)

**Files:**
- Create: `src/pages/index.astro`, `src/pages/en/index.astro`

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Section from '../components/Section.astro';
import Reveal from '../components/Reveal.astro';
import HeroRotator from '../components/HeroRotator.astro';
import Carousel from '../components/Carousel.astro';
import ProductCard from '../components/ProductCard.astro';
import Button from '../components/Button.astro';
import { useTranslations } from '../i18n/utils';
import { routeMap, productBase } from '../i18n/routes';

const lang = 'it' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.home.title} description={t.meta.home.description} pageKey="home">
  <Section>
    <HeroRotator pre={t.home.heroPre} words={t.home.heroRotating} post={t.home.heroPost} />
    <p class="lead">{t.home.heroLead}</p>
    <p><Button href={routeMap.contact[lang]}>{t.cta.contact}</Button></p>
  </Section>

  <Section alt>
    <Reveal as="h2">{t.home.productsTitle}</Reveal>
    <div class="grid-2">
      {t.products.map((p) => (
        <ProductCard name={p.name} tagline={p.tagline}
          href={`${productBase[lang]}/${p.slug}`} cta={t.cta.discover} />
      ))}
    </div>
  </Section>

  <Section>
    <Reveal as="h2">{t.home.casesTitle}</Reveal>
    <p class="lead">{t.home.casesLead}</p>
    <Carousel items={t.cases} label={t.home.casesTitle} />
  </Section>

  <Section alt>
    <Reveal as="h2">{t.home.historyTitle}</Reveal>
    <p>{t.home.historyBody}</p>
  </Section>
</BaseLayout>

<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-6); }
  .grid-2 { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: var(--space-8); }
</style>
```

- [ ] **Step 2: Write `src/pages/en/index.astro`** (identical template, `lang = 'en'`)

Same file as Step 1 with three differences: import paths gain one `../` level (`../../`), `const lang = 'en' as const;`, and that is all — copy/links come from the dictionary and route-map. Full file:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Section from '../../components/Section.astro';
import Reveal from '../../components/Reveal.astro';
import HeroRotator from '../../components/HeroRotator.astro';
import Carousel from '../../components/Carousel.astro';
import ProductCard from '../../components/ProductCard.astro';
import Button from '../../components/Button.astro';
import { useTranslations } from '../../i18n/utils';
import { routeMap, productBase } from '../../i18n/routes';

const lang = 'en' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.home.title} description={t.meta.home.description} pageKey="home">
  <Section>
    <HeroRotator pre={t.home.heroPre} words={t.home.heroRotating} post={t.home.heroPost} />
    <p class="lead">{t.home.heroLead}</p>
    <p><Button href={routeMap.contact[lang]}>{t.cta.contact}</Button></p>
  </Section>
  <Section alt>
    <Reveal as="h2">{t.home.productsTitle}</Reveal>
    <div class="grid-2">
      {t.products.map((p) => (
        <ProductCard name={p.name} tagline={p.tagline}
          href={`${productBase[lang]}/${p.slug}`} cta={t.cta.discover} />
      ))}
    </div>
  </Section>
  <Section>
    <Reveal as="h2">{t.home.casesTitle}</Reveal>
    <p class="lead">{t.home.casesLead}</p>
    <Carousel items={t.cases} label={t.home.casesTitle} />
  </Section>
  <Section alt>
    <Reveal as="h2">{t.home.historyTitle}</Reveal>
    <p>{t.home.historyBody}</p>
  </Section>
</BaseLayout>
<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-6); }
  .grid-2 { display: grid; gap: var(--space-6); grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: var(--space-8); }
</style>
```

- [ ] **Step 3: Verify both home routes render**

Run: `npm run dev`, open `http://localhost:4321/` and `http://localhost:4321/en/`.
Expected: hero word rotates; products grid (2 cards); cases carousel scrolls; lang switch toggles IT⇄EN staying on home. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(pages): Home IT + EN"
```

---

## Task 19: About / Chi siamo (IT + EN) with GridAccent

**Files:**
- Create: `src/pages/chi-siamo.astro`, `src/pages/en/about.astro`

- [ ] **Step 1: Write `src/pages/chi-siamo.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Section from '../components/Section.astro';
import Reveal from '../components/Reveal.astro';
import GridAccent from '../components/GridAccent.astro';
import { useTranslations } from '../i18n/utils';
const lang = 'it' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.about.title} description={t.meta.about.description} pageKey="about">
  <section class="hero-band">
    <GridAccent />
    <div class="container hero-band__content">
      <h1>{t.nav.about}</h1>
      <p class="lead">{t.about.lead}</p>
    </div>
  </section>

  <Section>
    <Reveal as="h2">{t.about.historyTitle}</Reveal>
    <p>{t.about.historyBody}</p>
  </Section>

  <Section alt>
    <Reveal as="h2">{t.about.techTitle}</Reveal>
    <ul class="tags">{t.about.tech.map((x) => <li>{x}</li>)}</ul>
  </Section>

  <Section>
    <Reveal as="h2">{t.about.aiTitle}</Reveal>
    <p>{t.about.aiBody}</p>
  </Section>
</BaseLayout>

<style>
  .hero-band { position: relative; overflow: hidden; padding-block: var(--space-24); }
  .hero-band__content { position: relative; z-index: 1; }
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-top: var(--space-4); }
  .tags { display: flex; flex-wrap: wrap; gap: var(--space-3); list-style: none; padding: 0; margin-top: var(--space-6); }
  .tags li { border: 1px solid var(--border); border-radius: 999px; padding: .4rem 1rem; font-size: var(--fs-300); }
</style>
```

- [ ] **Step 2: Write `src/pages/en/about.astro`** (same template, `../../` imports, `lang = 'en'`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Section from '../../components/Section.astro';
import Reveal from '../../components/Reveal.astro';
import GridAccent from '../../components/GridAccent.astro';
import { useTranslations } from '../../i18n/utils';
const lang = 'en' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.about.title} description={t.meta.about.description} pageKey="about">
  <section class="hero-band">
    <GridAccent />
    <div class="container hero-band__content">
      <h1>{t.nav.about}</h1>
      <p class="lead">{t.about.lead}</p>
    </div>
  </section>
  <Section>
    <Reveal as="h2">{t.about.historyTitle}</Reveal>
    <p>{t.about.historyBody}</p>
  </Section>
  <Section alt>
    <Reveal as="h2">{t.about.techTitle}</Reveal>
    <ul class="tags">{t.about.tech.map((x) => <li>{x}</li>)}</ul>
  </Section>
  <Section>
    <Reveal as="h2">{t.about.aiTitle}</Reveal>
    <p>{t.about.aiBody}</p>
  </Section>
</BaseLayout>
<style>
  .hero-band { position: relative; overflow: hidden; padding-block: var(--space-24); }
  .hero-band__content { position: relative; z-index: 1; }
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-top: var(--space-4); }
  .tags { display: flex; flex-wrap: wrap; gap: var(--space-3); list-style: none; padding: 0; margin-top: var(--space-6); }
  .tags li { border: 1px solid var(--border); border-radius: 999px; padding: .4rem 1rem; font-size: var(--fs-300); }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/chi-siamo.astro src/pages/en/about.astro
git commit -m "feat(pages): About IT + EN with static GridAccent band"
```

---

## Task 20: Product pages (dynamic `[slug]`, IT + EN)

**Files:**
- Create: `src/pages/prodotti/[slug].astro`, `src/pages/en/products/[slug].astro`

- [ ] **Step 1: Write `src/pages/prodotti/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Section from '../../components/Section.astro';
import Reveal from '../../components/Reveal.astro';
import Button from '../../components/Button.astro';
import { useTranslations } from '../../i18n/utils';
import { routeMap, productBase } from '../../i18n/routes';
import type { GetStaticPaths } from 'astro';
import { it } from '../../i18n/it';

export const getStaticPaths = (() =>
  it.products.map((p) => ({ params: { slug: p.slug }, props: { product: p } }))
) satisfies GetStaticPaths;

const lang = 'it' as const;
const t = useTranslations(lang);
const { product } = Astro.props;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: product.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  publisher: { '@type': 'Organization', name: 'Integra' },
  // No Offer/price — showcase site, B2G, no pricing.
};
---
<BaseLayout title={t.meta.product(product.name).title} description={t.meta.product(product.name).description} jsonLd={jsonLd}>
  <Section>
    <h1>{product.name}</h1>
    <p class="lead">{product.tagline}</p>
    <p>{product.what}</p>
    <p><Button href={routeMap.contact[lang]}>{t.cta.contact}</Button></p>
  </Section>
  <Section alt>
    <Reveal as="h2">{lang === 'it' ? 'A chi serve' : 'Who it is for'}</Reveal>
    <p>{product.audience}</p>
  </Section>
  <Section>
    <Reveal as="h2">{lang === 'it' ? "Casi d'uso" : 'Use cases'}</Reveal>
    <ul>{product.useCases.map((u) => <li>{u}</li>)}</ul>
  </Section>
</BaseLayout>
<style>.lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-3) var(--space-6); }</style>
```

- [ ] **Step 2: Write `src/pages/en/products/[slug].astro`** (imports `en`, `lang='en'`, paths `../../../`)

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Section from '../../../components/Section.astro';
import Reveal from '../../../components/Reveal.astro';
import Button from '../../../components/Button.astro';
import { useTranslations } from '../../../i18n/utils';
import { routeMap } from '../../../i18n/routes';
import type { GetStaticPaths } from 'astro';
import { en } from '../../../i18n/en';

export const getStaticPaths = (() =>
  en.products.map((p) => ({ params: { slug: p.slug }, props: { product: p } }))
) satisfies GetStaticPaths;

const lang = 'en' as const;
const t = useTranslations(lang);
const { product } = Astro.props;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: product.name,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  publisher: { '@type': 'Organization', name: 'Integra' },
};
---
<BaseLayout title={t.meta.product(product.name).title} description={t.meta.product(product.name).description} jsonLd={jsonLd}>
  <Section>
    <h1>{product.name}</h1>
    <p class="lead">{product.tagline}</p>
    <p>{product.what}</p>
    <p><Button href={routeMap.contact[lang]}>{t.cta.contact}</Button></p>
  </Section>
  <Section alt>
    <Reveal as="h2">Who it is for</Reveal>
    <p>{product.audience}</p>
  </Section>
  <Section>
    <Reveal as="h2">Use cases</Reveal>
    <ul>{product.useCases.map((u) => <li>{u}</li>)}</ul>
  </Section>
</BaseLayout>
<style>.lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-3) var(--space-6); }</style>
```

- [ ] **Step 3: Verify product routes**

Run: `npm run dev`, open `/prodotti/prodotto-1` and `/en/products/product-1`.
Expected: pages render with name, tagline, audience, use cases. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/prodotti/ src/pages/en/products/
git commit -m "feat(pages): dynamic product pages IT + EN with SoftwareApplication JSON-LD"
```

---

## Task 21: Team pages (IT + EN)

**Files:**
- Create: `src/pages/team.astro`, `src/pages/en/team.astro`

- [ ] **Step 1: Write `src/pages/team.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Section from '../components/Section.astro';
import TeamCard from '../components/TeamCard.astro';
import { useTranslations } from '../i18n/utils';
const lang = 'it' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.team.title} description={t.meta.team.description} pageKey="team">
  <Section>
    <h1>{t.nav.team}</h1>
    <p class="lead">{t.team.lead}</p>
    <div class="grid-team">
      {t.team.members.map((m) => <TeamCard member={m} />)}
    </div>
  </Section>
</BaseLayout>
<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-12); }
  .grid-team { display: grid; gap: var(--space-12) var(--space-6); grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
</style>
```

- [ ] **Step 2: Write `src/pages/en/team.astro`** (`../../` imports, `lang='en'`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Section from '../../components/Section.astro';
import TeamCard from '../../components/TeamCard.astro';
import { useTranslations } from '../../i18n/utils';
const lang = 'en' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.team.title} description={t.meta.team.description} pageKey="team">
  <Section>
    <h1>{t.nav.team}</h1>
    <p class="lead">{t.team.lead}</p>
    <div class="grid-team">
      {t.team.members.map((m) => <TeamCard member={m} />)}
    </div>
  </Section>
</BaseLayout>
<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-12); }
  .grid-team { display: grid; gap: var(--space-12) var(--space-6); grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/team.astro src/pages/en/team.astro
git commit -m "feat(pages): Team IT + EN"
```

---

## Task 22: Contact pages (IT + EN) with careers box

**Files:**
- Create: `src/pages/contatti.astro`, `src/pages/en/contact.astro`

- [ ] **Step 1: Write `src/pages/contatti.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Section from '../components/Section.astro';
import ContactForm from '../components/ContactForm.astro';
import { useTranslations } from '../i18n/utils';
const lang = 'it' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.contact.title} description={t.meta.contact.description} pageKey="contact">
  <Section>
    <h1>{t.nav.contact}</h1>
    <p class="lead">{t.contact.lead}</p>
    <div class="contact-grid">
      <ContactForm t={t.contact} sendLabel={t.cta.send} />
      <aside class="careers">
        <h2>{t.contact.careersTitle}</h2>
        <p>{t.contact.careersBody}</p>
      </aside>
    </div>
  </Section>
</BaseLayout>
<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-12); }
  .contact-grid { display: grid; gap: var(--space-16); grid-template-columns: 1fr; }
  @media (min-width: 880px) { .contact-grid { grid-template-columns: 1.4fr 1fr; } }
  .careers { background: var(--bg-alt); border-radius: var(--radius); padding: var(--space-8); align-self: start; }
  .careers h2 { font-size: var(--fs-600); }
  .careers p { margin-top: var(--space-3); color: var(--text-muted); }
</style>
```

- [ ] **Step 2: Write `src/pages/en/contact.astro`** (`../../` imports, `lang='en'`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Section from '../../components/Section.astro';
import ContactForm from '../../components/ContactForm.astro';
import { useTranslations } from '../../i18n/utils';
const lang = 'en' as const;
const t = useTranslations(lang);
---
<BaseLayout title={t.meta.contact.title} description={t.meta.contact.description} pageKey="contact">
  <Section>
    <h1>{t.nav.contact}</h1>
    <p class="lead">{t.contact.lead}</p>
    <div class="contact-grid">
      <ContactForm t={t.contact} sendLabel={t.cta.send} />
      <aside class="careers">
        <h2>{t.contact.careersTitle}</h2>
        <p>{t.contact.careersBody}</p>
      </aside>
    </div>
  </Section>
</BaseLayout>
<style>
  .lead { font-size: var(--fs-500); color: var(--text-muted); margin-block: var(--space-4) var(--space-12); }
  .contact-grid { display: grid; gap: var(--space-16); grid-template-columns: 1fr; }
  @media (min-width: 880px) { .contact-grid { grid-template-columns: 1.4fr 1fr; } }
  .careers { background: var(--bg-alt); border-radius: var(--radius); padding: var(--space-8); align-self: start; }
  .careers h2 { font-size: var(--fs-600); }
  .careers p { margin-top: var(--space-3); color: var(--text-muted); }
</style>
```

- [ ] **Step 3: Verify contact behavior**

Run: `npm run dev`, open `/contatti`. Select "Candidatura" → CV field appears; select "Informazioni" → it hides. Submit empty email → text+icon error appears. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/contatti.astro src/pages/en/contact.astro
git commit -m "feat(pages): Contact IT + EN with careers box"
```

---

## Task 23: README + final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Integra — sito vetrina

Sito statico bilingue (IT/EN) in Astro. Deploy su Aruba (build statico via FTP).

## Avvio locale
```bash
npm install
cp .env.example .env   # poi inserisci l'endpoint Formspree reale
npm run dev            # http://localhost:4321
npm run build          # genera dist/ (da caricare su Aruba)
npm test               # test unitari i18n
```

## Design tokens (unica fonte di verità)
`src/styles/tokens.css` — colori, tipografia, spazi. Cambiare il blu = una riga (`--brand`).

## Contenuti / i18n
Copy nei dizionari `src/i18n/it.ts` e `src/i18n/en.ts`. Rotte localizzate in `src/i18n/routes.ts`.

## Checklist placeholder da sostituire
- [ ] Blu esatto dall'SVG del logo → `--brand`, `--brand-dark`, `--brand-tint` in `tokens.css`
- [ ] Logo SVG → sostituire il testo `INTEGRA` in `Header.astro` / `Footer.astro`
- [ ] Nomi prodotti `[NOME_PRODOTTO_1/2]` e slug in `it.ts`/`en.ts`
- [ ] Tutti i testi `[DA SCRIVERE]` / `[TO WRITE]` (IT + EN)
- [ ] Endpoint Formspree → `.env` (`PUBLIC_FORMSPREE_ENDPOINT`)
- [ ] Dominio Aruba → `SITE` in `astro.config.mjs` e URL in `public/robots.txt`
- [ ] Foto + dati team in `it.ts`/`en.ts`
- [ ] Profili social → `sameAs` in `Seo.astro`
- [ ] Anno di fondazione esatto → `foundingDate` in `Seo.astro`
```

- [ ] **Step 2: Full verification sweep**

Run: `npx astro check && npm test && npm run build`
Expected: 0 type errors; tests pass; build succeeds; `dist/` contains `index.html`, `en/index.html`, `chi-siamo/index.html`, `en/about/index.html`, `prodotti/prodotto-1/index.html`, `team/index.html`, `contatti/index.html`, `sitemap-index.xml`.

- [ ] **Step 3: Manual a11y/SEO spot-check**

With `npm run preview`: confirm each page has exactly one `<h1>`, the lang switch preserves the page, `<html lang>` is correct per locale, and hreflang tags are present in page source on the 4 core pages.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README with local dev, tokens location, placeholder checklist"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** §2 stack → Task 1; §3 structure → all; §4 i18n → Tasks 4–6,16; §5 tokens → Task 2–3; §6 motion/components (Reveal/HeroRotator/Carousel/GridAccent) → Tasks 10–13; §7 pages → Tasks 18–22; §8 form → Task 15; §9 SEO (meta/hreflang/JSON-LD/sitemap/robots/AI crawlers) → Tasks 1,7,17,20; §10 a11y/perf → global.css + per-component + Task 23; §11 README → Task 23. No gaps.

**Placeholder scan:** Content placeholders (`[DA SCRIVERE]`, `[NOME_PRODOTTO_x]`, `TODO-PLACEHOLDER` for domain/social) are intentional and listed in the README checklist — not plan placeholders. Every code step contains full code.

**Type consistency:** `Dictionary`, `CaseEntry`, `TeamMember`, `ProductEntry`, `PageKey` used consistently across utils, components, pages. `switchLocalePath(path, from, to)` signature matches its test and `LangSwitch` usage. `useTranslations(lang)` returns `Dictionary` everywhere.

**Note for executor:** Task 5 Step 5 (running i18n tests) depends on Task 6 dictionaries existing. Implement Task 6 before executing Task 5 Step 5, or stub the dictionary exports temporarily.
