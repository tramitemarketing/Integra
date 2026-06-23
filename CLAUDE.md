# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Integra — a bilingual (IT/EN) static marketing/showcase site built with **Astro 5**. Output is a fully static `dist/` deployed to Aruba hosting via FTP. The site is built and functional; it currently awaits real client content (placeholders like `[DA SCRIVERE]` / `[NOME_PRODOTTO_x]` are intentional). See `CONSEGNA-CLIENTE.md` for the client-facing list of content still needed.

## Commands

```bash
npm run dev      # dev server at http://localhost:4321
npm run build    # static build into dist/ (the deploy artifact)
npm run preview  # serve the built dist/
npm test         # vitest run (unit tests, primarily i18n)
npx vitest run src/i18n/utils.test.ts   # run a single test file
npx astro check  # type-check .astro files
```

Requires Node >= 18. Local env: copy `.env.example` to `.env` and set `PUBLIC_FORMSPREE_ENDPOINT` (the contact form's submit target).

## Architecture

### i18n is the backbone — everything routes through it
- **Two locales, IT is default and unprefixed; EN lives under `/en/`** (configured in `astro.config.mjs`, `prefixDefaultLocale: false`).
- **Pages are duplicated per language**, not generated from a single template: `src/pages/*.astro` (IT) mirror `src/pages/en/*.astro` (EN). When adding or changing a page, change both sides.
- **All copy lives in dictionaries**, never inline in pages: `src/i18n/it.ts` and `src/i18n/en.ts`, both typed against `Dictionary` in `src/i18n/types.ts`. The two dictionaries must stay structurally identical — the shared interface enforces this, so `astro check` catches drift.
- `src/i18n/utils.ts`: `getLangFromUrl(url)` derives lang from the first path segment; `useTranslations(lang)` returns the dictionary. A page reads `const lang = getLangFromUrl(Astro.url); const t = useTranslations(lang)`.
- **Localized routing/URL equivalence** is centralized in `src/i18n/routes.ts` (`routeMap` for fixed pages, `productBase` + dictionary slugs for products). `switchLocalePath()` in `utils.ts` powers the language switcher by mapping the current path to its counterpart in the other language — falling back to home. Add new pages to `routeMap` so the switcher works.
- **Products are data-driven**: `src/i18n/{it,en}.ts` hold a `products[]` array; pages `src/pages/prodotti/[slug].astro` and `src/pages/en/products/[slug].astro` generate one page per entry. Product order must match across languages — `switchLocalePath` maps products by array *index*, not slug.

### Layout & styling
- `src/layouts/BaseLayout.astro` wraps every page: sets `<html lang>`, renders `Seo`, `Header`, `Footer`, optional `Breadcrumb`, and the `ScrollPath` progress indicator. Props: `title`, `description`, `pageKey` (drives SEO/canonical), `jsonLd`, `breadcrumb`.
- **`src/styles/tokens.css` is the single source of truth for design tokens** (brand colors, type scale, spacing, shape). Changing the brand blue = editing `--brand` (and its hue variants). Prefer adding/using a token over hardcoding values. `global.css` consumes these tokens.
- Components in `src/components/` are plain `.astro` (no UI framework). Interactive ones (`HeroRotator`, `Carousel`, `CountUp`, `Terminal`, `LangSwitch`, `ScrollPath`, `Reveal`) ship small inline `<script>` blocks; respect `prefers-reduced-motion`.

### SEO
- `src/components/Seo.astro` centralizes meta tags, canonical/hreflang (using `routeMap`), and JSON-LD. Several launch placeholders live here (`sameAs` social profiles, `foundingDate`, OG image path).

## Temporary handoff scaffolding (REMOVE before launch)
- **`SectionCode` badges**: `src/components/SectionCode.astro` renders small `A1`/`B2` codes on each section so the client can map real copy ("A1 = …"). The code→section legend is in `README.md`. Before launch, remove all `SectionCode` imports + tags from pages and delete the component. Rendered elements carry `data-section-code` to find them in HTML.

## Conventions
- Comments and the README are in Italian; UI copy is bilingual. Keep new copy in the dictionaries, in both languages.
- This is a static site — no server runtime, no DB. The contact form posts to Formspree (`ContactForm.astro`, endpoint from `PUBLIC_FORMSPREE_*`).
- Before deploy, work through the placeholder checklist in `README.md` (brand color from logo SVG, product names/slugs, legal footer data, Formspree endpoint, real domain in `astro.config.mjs` `SITE` + `robots.txt`).
