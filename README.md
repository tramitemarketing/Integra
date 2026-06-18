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
- [ ] OG image: export `public/og-image.svg` to PNG (social crawlers don't render SVG) and update the path in `src/components/Seo.astro`
