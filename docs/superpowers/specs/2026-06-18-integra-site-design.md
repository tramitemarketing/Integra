# Integra — Sito vetrina · Design spec

**Data:** 2026-06-18
**Stato:** approvato (design), in attesa di review dello spec scritto
**Tipo:** sito statico vetrina, bilingue (IT/EN), B2G

---

## 1. Contesto

**Integra** è una software house attiva da 25 anni, sede a L'Aquila, operativa anche online.
Vende **due prodotti software** a **municipalità / comuni** (B2G), con ciclo di vendita
relazionale (no e-commerce). Il sito è una **vetrina pura**: niente e-commerce, prenotazioni,
prezzi o area riservata. Aggiornamenti rari.

**Posizionamento:** azienda storica e affidabile MA moderna (uso intensivo dell'AI nello
sviluppo). I 25 anni sono un valore (pionieri del settore). La modernità deve venire
dall'**esecuzione** (spazio, tipografia, ritmo, motion), non da effetti "tech-futuristici".

**Obiettivo di questa prima sessione:** progetto navigabile, design system impostato, tutte
le pagine in piedi in IT+EN con placeholder strutturati. Niente testi definitivi.

## 2. Decisioni bloccate

| Decisione | Scelta |
|-----------|--------|
| Framework | **Astro** (statico, zero JS di default, i18n nativo, ottimi CWV) |
| Output | `output: 'static'` |
| Deploy | **Aruba** (upload build via FTP). `site` = dominio Aruba. Niente adapter. |
| Linguaggio | TypeScript |
| Font corpo/UI | **Inter** (400, 500/600) — self-hosted |
| Font titoli | **Space Grotesk** — self-hosted |
| i18n | Astro nativo, IT su `/` (no prefisso), EN su `/en/` |
| Copy | Dizionari TS (`it.ts`/`en.ts`), non content collections |
| Form | **Formspree**, endpoint configurabile via env |
| Repo | Git separato dentro `INTEGRA/` (branch `main`) |

## 3. Struttura del progetto

```
INTEGRA/
├─ astro.config.mjs        # i18n + @astrojs/sitemap + site url
├─ package.json · tsconfig.json · README.md · .env.example · .gitignore
├─ public/
│  ├─ fonts/               # Inter + Space Grotesk .woff2 (self-hosted)
│  ├─ og-image.svg · favicon.svg
│  ├─ placeholder/         # segnaposto SVG con proporzioni corrette
│  └─ robots.txt
└─ src/
   ├─ styles/
   │  ├─ tokens.css        # ★ UNICA FONTE DI VERITÀ: colori + tipografia + spazi
   │  └─ global.css        # reset, @font-face, base, utility, motion
   ├─ i18n/
   │  ├─ it.ts · en.ts     # dizionari di copy + meta SEO per pagina
   │  └─ utils.ts          # useTranslations(lang), getLangFromUrl, switchLocalePath
   ├─ layouts/
   │  └─ BaseLayout.astro  # <head>, Seo, Header, Footer, slot
   ├─ components/
   │  ├─ Header.astro · Footer.astro · LangSwitch.astro
   │  ├─ Button.astro · Section.astro · Reveal.astro
   │  ├─ HeroRotator.astro · Carousel.astro · GridAccent.astro
   │  ├─ ProductCard.astro · TeamCard.astro
   │  ├─ ContactForm.astro
   │  └─ Seo.astro         # title, meta, canonical, OG, hreflang, JSON-LD
   └─ pages/
      ├─ index.astro · chi-siamo.astro · team.astro · contatti.astro
      ├─ prodotti/[slug].astro
      └─ en/
         ├─ index.astro · about.astro · team.astro · contact.astro
         └─ products/[slug].astro
```

## 4. i18n

- **Astro nativo** con `i18n: { defaultLocale: 'it', locales: ['it','en'], routing: { prefixDefaultLocale: false } }` → IT senza prefisso, EN sotto `/en/`.
- **Copy in dizionari TS** type-safe (`it.ts`/`en.ts`). Helper `useTranslations(lang)`.
- **Slug localizzati**: `/chi-siamo` ↔ `/en/about`, `/contatti` ↔ `/en/contact`, `/prodotti/[slug]` ↔ `/en/products/[slug]`. Una **route-map** centralizzata gestisce le coppie.
- **Switch lingua** (`LangSwitch.astro`): usa la route-map per restare sulla pagina equivalente nell'altra lingua; fallback alla home se non c'è equivalente.
- Punti che richiedono testo reale marcati `[DA SCRIVERE]`. Nomi prodotti: `[NOME_PRODOTTO_1]`, `[NOME_PRODOTTO_2]`.

## 5. Design system — `tokens.css` (unica fonte di verità)

Tutti i token come CSS custom properties in **un solo file**. Cambiare il blu = una riga.

```css
:root {
  /* === BRAND — VALORI PROVVISORI, DA SOSTITUIRE col blu esatto dell'SVG === */
  --brand: #2E2ECC;
  --brand-dark: #1E1E8A;
  --brand-tint: #EDEDFB;
  /* === NEUTRI (la "tela") === */
  --bg: #FFFFFF;
  --bg-alt: #F6F7F9;
  --text: #15161C;
  --text-muted: #5B5E6B;
  --border: #E4E6EB;
  /* + scala tipografica, spazi, radius, max-width contenuti */
}
```

**Regola d'uso colore — 70/20/10:** ~70% neutri chiari, ~20% scuro (testo/sezioni serie),
~10% blu di brand. Il blu **solo** su: bottone primario, link, hover, una linea, un dato in
evidenza. **Mai** blu a tappeto sulle sezioni.

**Tipografia:** scala ariosa, gerarchia netta H1/H2/H3/corpo, line-height corpo ~1.6.
Solo Inter + Space Grotesk, pochi pesi. Nessuna terza famiglia.

**Vincoli espliciti (NON fare):** niente gradienti, cerchi concentrici, orbite, corsivi che
"richiamano" il logo; niente font/effetti futuristici-spaziali; niente blu a tappeto; niente
terza famiglia di font né eccesso di pesi. Il sito fa **contrasto** col logo (pulito = il logo
legge come heritage).

**Logo:** placeholder testuale "INTEGRA" in alto a sinistra. Quando arriva l'SVG va
**contenuto** (piccolo, su fondo bianco, con aria intorno).

## 6. Motion & componenti animati (sobrio, zero framework)

- `Reveal.astro` + ~15 righe di JS vanilla con `IntersectionObserver`: fade/slide-in leggeri
  allo scroll; transizioni morbide su hover via CSS. Rispetta `prefers-reduced-motion`.
- `HeroRotator.astro` — una **singola parola reale** che ruota lenta nel titolo hero
  (es. *comuni · PA · territori*), in **vanilla JS**. Altezza fissa per evitare layout shift;
  fallback **statico** con `prefers-reduced-motion`. NON parole generiche tipo "amazing"
  (novelty vietata dal brief).
- `Carousel.astro` — carousel orizzontale **CSS scroll-snap** + ~30 righe JS (frecce + dot +
  drag), niente librerie React/embla. Card con immagine + **scrim** funzionale per leggibilità
  del testo (uso legittimo del gradiente: contrasto, non decorazione). Usato per i **casi d'uso /
  comuni clienti**.
- `GridAccent.astro` — **blueprint grid statica** (SVG/CSS) a opacità bassissima in tinta
  neutra/`--brand-tint`, su **una sola** fascia (es. Chi siamo o footer). Statica, niente
  animazione/mesh navy/ASCII: legge come "ingegneria/heritage tecnico", non come effetto spaziale.

Tutto rispetta `prefers-reduced-motion`. Nessun JS di libreria; tutto vanilla per preservare
lo zero-JS e Lighthouse alto. *(Origine: tre componenti di riferimento React/WebGL forniti dal
committente, reinterpretati per rispettare brief + accessibilità; lo shader WebGL animato è
escluso e conservato per un futuro progetto tech/AI — vedi §12.)*

## 7. Le 6 pagine (IT + EN, placeholder strutturati)

1. **Home** — hero con posizionamento (`HeroRotator`: titolo con singola parola rotante sobria),
   sintesi dei due prodotti, fascia **casi d'uso/comuni** in `Carousel`, accenno storia/AI,
   CTA contatti.
2. **Chi siamo** — heritage 25 anni (pionieri, rivoluzioni tecnologiche attraversate),
   tecnologie usate, approccio AI. È **qui** che si racconta l'heritage, non nella grafica.
3. **Prodotto 1** (`[NOME_PRODOTTO_1]`) — cos'è, a chi serve, casi d'uso.
4. **Prodotto 2** (`[NOME_PRODOTTO_2]`) — stessa struttura.
5. **Team** — 4–6 schede placeholder (foto segnaposto + ruolo + bio breve).
6. **Contatti** — form (Informazioni/Candidatura) + box valorizzato "Lavora con noi".

Le pagine prodotto sono generate da `prodotti/[slug].astro` con i dati prodotto nei dizionari.

Copy plausibile e strutturato in IT, EN abbozzato, punti reali marcati `[DA SCRIVERE]`.
Immagini: segnaposto SVG con proporzioni corrette (niente immagini pesanti casuali).

## 8. Form contatti / candidature

- **Tipo richiesta in cima** al form come **radio in `<fieldset>`/`<legend>`** (`Informazioni` |
  `Candidatura`): determina il resto del form, quindi guida il flusso (revisione coi principi:
  gerarchia + divulgazione progressiva).
- Campi: **nome**, **email**, **messaggio** (+ campo opzionale allegato/link CV mostrato
  **solo** quando tipo = Candidatura, via progressive enhancement; visibile come fallback senza JS).
- Validazione **HTML5 nativa** (required, type=email). Errori segnalati con **testo + icona**,
  non solo colore (accessibilità — rilevante per gli obblighi della PA), via `aria-describedby`.
- Layout **colonna singola**, label esplicite `<label>` (non solo placeholder), focus visibile,
  ordine di tab logico, tap target ≥44px.
- `action` = `PUBLIC_FORMSPREE_ENDPOINT` letto da `.env` (in `.env.example` con placeholder).
- Una sola azione primaria ad alto contrasto (**Invia**); nessuna azione secondaria in competizione.
- Nessun prezzo/preventivo. Honeypot anti-spam.

## 9. Layer SEO (by design)

- **Meta per pagina nei dizionari**: `title` (50–60 char) e `description` (150–160) unici per
  lingua. `Seo.astro` inietta title, description, canonical self-referencing, OG, Twitter card.
- **hreflang** reciproco IT↔EN su ogni pagina + `x-default` → Home IT.
- **Slug localizzati** (vedi §4), lowercase con trattini.
- **JSON-LD**:
  - `Organization` globale (nome, logo, `foundingDate` ~2001, `address` L'Aquila, `areaServed`
    Italia, `contactPoint`, `sameAs` quando arrivano i social).
  - `BreadcrumbList` sulle pagine interne.
  - Pagine prodotto: `SoftwareApplication` (o `Service`) **senza** `Offer`/prezzo (sito senza prezzi).
- **sitemap.xml** via `@astrojs/sitemap`; **robots.txt** con `Allow: /`, link sitemap, **non**
  blocca i crawler AI (ClaudeBot, OAI-SearchBot, PerplexityBot, Google-Extended).
- **Primo paragrafo auto-conclusivo** su ogni pagina (estraibile per snippet / risposte AI) —
  linea guida nei placeholder.
- Niente `llms.txt` (adozione ~0%, nessun vendor lo legge).

## 10. Accessibilità & performance

- Un solo `<h1>` per pagina, gerarchia heading corretta, HTML semantico.
- Contrasti AA, focus visibile, navigazione da tastiera.
- `alt` descrittivi anche sui segnaposto; `viewport` responsive; font ≥16px; tap target ≥48px.
- Obiettivo Lighthouse alto su tutte le metriche (favorito da zero JS framework + font self-hosted).

## 11. README

- Come avviare in locale (`npm install`, `npm run dev`, `npm run build`).
- Dove sta il file dei token (`src/styles/tokens.css`).
- **Checklist placeholder da sostituire:**
  - [ ] Blu esatto dall'SVG del logo (`--brand`, `--brand-dark`, `--brand-tint`)
  - [ ] Logo SVG (sostituire placeholder testuale)
  - [ ] `[NOME_PRODOTTO_1]`, `[NOME_PRODOTTO_2]`
  - [ ] Tutti i testi `[DA SCRIVERE]` (IT + EN)
  - [ ] Endpoint Formspree (`PUBLIC_FORMSPREE_ENDPOINT`)
  - [ ] Dominio Aruba (`site` in `astro.config.mjs`)
  - [ ] Foto team + dati persone
  - [ ] Profili social (`sameAs` in JSON-LD)

## 12. Fuori scope (YAGNI)

- E-commerce, prezzi, preventivi, prenotazioni, area riservata.
- CMS / content collections (dizionari TS sufficienti per 6 pagine + aggiornamenti rari).
- `llms.txt`, blog, multi-currency.
- **Background shader WebGL animato** (mesh gradient navy + griglia animata + ASCII + dither):
  escluso perché contraddice il brief (gradiente/effetto spaziale/blu a tappeto) e penalizza
  CWV/accessibilità. Componente di riferimento conservato per un futuro progetto tech/AI.
- React / framer-motion / shadcn-embla: non introdotti; gli effetti voluti (hero rotante,
  carousel) sono reimplementati in vanilla per preservare lo zero-JS.
- Refinement visivo definitivo (sarà una fase successiva, con le skill `ui-ux-pro-max` +
  `ui-design-principles`).

## 13. Output atteso della sessione di implementazione

1. Progetto Astro scaffoldato e avviabile in locale.
2. `tokens.css` come unica fonte di verità (colori + tipografia).
3. Tutte le 6 pagine in piedi in IT + EN con placeholder strutturati.
4. Header/footer/navigazione + switch lingua funzionanti.
5. README con avvio locale, posizione token, checklist placeholder.
