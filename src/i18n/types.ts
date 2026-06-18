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
  a11y: { skipLink: string; navPrimary: string; photoOf: string; carouselPrev: string; carouselNext: string };
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
