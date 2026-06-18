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

## Codici di sezione (aiuto per il handoff — TEMPORANEI)
Ogni sezione mostra un piccolo badge tratteggiato con un codice (es. `A1`, `B2`). Servono a
mappare velocemente i testi reali: il cliente scrive "A1 = …, A2 = …" e sappiamo esattamente
dove va ogni contenuto. Stesso codice su IT ed EN.

| Codice | Pagina | Sezione |
|---|---|---|
| A1 | Home | Hero (claim + parola rotante + CTA) |
| A2 | Home | I due prodotti |
| A3 | Home | Casi d'uso / comuni (carousel) |
| A4 | Home | Heritage (count-up "25" + titolo + testo) |
| B1 | Chi siamo | Intro (titolo + lead) |
| B2 | Chi siamo | Storia |
| B3 | Chi siamo | Tecnologie |
| B4 | Chi siamo | Approccio AI |
| C1 | Prodotto | Intro (nome + tagline + cos'è + CTA) |
| C2 | Prodotto | A chi serve |
| C3 | Prodotto | Casi d'uso |
| D1 | Team | Intro (titolo + lead) |
| D2 | Team | Schede persone |
| E1 | Contatti | Form (intro + modulo) |
| E2 | Contatti | Box "Lavora con noi" |

**Rimuovere prima del lancio:** cerca nel codice `SectionCode` (gli import + i tag nelle pagine)
e il componente `src/components/SectionCode.astro`. Gli elementi resi hanno l'attributo
`data-section-code` per individuarli anche nell'HTML.

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
- [ ] Testo **informativa privacy** → pagine `/privacy` e `/en/privacy` (segnaposti `[DA COMPLETARE]`)
- [ ] **Dati legali** footer (P.IVA, REA, capitale sociale, sede) → `footer.legal` in `it.ts` / `en.ts`
