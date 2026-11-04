import { Schema } from "effect";

import type { LinkEvidence } from "./page-evidence.js";

export const CRAWL_PAGES = 4;

export const CrawlRoleSchema = Schema.Literals([
  "product",
  "contact",
  "statement",
  "sign_in",
]);

export type CrawlRole = typeof CrawlRoleSchema.Type;

export const CRAWL_ORDER: readonly CrawlRole[] = [
  "statement",
  "contact",
  "product",
  "sign_in",
];

export interface CrawlPick {
  readonly role: CrawlRole;
  readonly url: string;
}

interface RoleSigns {
  readonly path: RegExp;
  readonly text: RegExp;
}

const words = (list: readonly string[]): RegExp =>
  new RegExp(`(?:^|[^\\p{L}])(?:${list.join("|")})(?:$|[^\\p{L}])`, "iu");

const segments = (list: readonly string[]): RegExp =>
  new RegExp(`(?:^|/)(?:${list.join("|")})(?:$|[/._-])`, "iu");

export const ROLE_SIGNS: Readonly<Record<CrawlRole, RoleSigns>> = {
  contact: {
    path: segments([
      "contact",
      "contact-us",
      "contacts",
      "contacto",
      "contactos",
      "contatti",
      "contato",
      "contactez-nous",
      "kontakt",
      "kontakte",
      "kontakty",
      "kontakti",
      "kontaktai",
      "kontaktid",
      "kapcsolat",
      "yhteystiedot",
      "epikoinonia",
      "kuntatt",
    ]),
    text: words([
      "contact",
      "contact us",
      "contactez-nous",
      "contacto",
      "contáctenos",
      "contatti",
      "contattaci",
      "contato",
      "contacte",
      "kontakt",
      "kontakty",
      "kontakti",
      "kontaktai",
      "kontaktid",
      "kapcsolat",
      "yhteystiedot",
      "ota yhteyttä",
      "επικοινωνία",
      "контакти",
      "kuntatt",
      "teagmháil",
    ]),
  },
  product: {
    path: /(?:^|\/)(?:products?|produ[ck]te?|produkty|produit|produits|producto|productos|prodotto|prodotti|produto|produtos|produse|artikel|tuote|termek|item|dp|p)\/[^/?#]+/iu,
    text: /(?!)/u,
  },
  sign_in: {
    path: segments([
      "login",
      "log-in",
      "signin",
      "sign-in",
      "sign_in",
      "anmelden",
      "anmeldung",
      "connexion",
      "prihlaseni",
      "prihlasenie",
      "logowanie",
      "accedi",
      "inloggen",
      "kirjaudu",
      "bejelentkezes",
      "iniciar-sesion",
      "entrar",
    ]),
    text: words([
      "sign in",
      "log in",
      "login",
      "anmelden",
      "einloggen",
      "přihlásit",
      "přihlásit se",
      "přihlášení",
      "prihlásiť",
      "prihlásenie",
      "connexion",
      "se connecter",
      "iniciar sesión",
      "accedi",
      "inloggen",
      "zaloguj",
      "zaloguj się",
      "logowanie",
      "logga in",
      "log ind",
      "logg inn",
      "kirjaudu",
      "bejelentkezés",
      "iniciar sessão",
      "autentificare",
      "вход",
      "σύνδεση",
      "prijava",
      "prisijungti",
      "pieslēgties",
      "logi sisse",
      "idħol",
    ]),
  },
  statement: {
    path: segments([
      "accessibility",
      "accessibility-statement",
      "a11y",
      "barrierefreiheit",
      "erklaerung-zur-barrierefreiheit",
      "pristupnost",
      "prohlaseni-o-pristupnosti",
      "pristupnost-webu",
      "accessibilite",
      "declaration-accessibilite",
      "accesibilidad",
      "declaracion-de-accesibilidad",
      "accessibilita",
      "dichiarazione-di-accessibilita",
      "toegankelijkheid",
      "toegankelijkheidsverklaring",
      "dostepnosc",
      "deklaracja-dostepnosci",
      "tillganglighet",
      "tillganglighetsredogorelse",
      "tilgaengelighed",
      "tilgaengelighedserklaering",
      "saavutettavuus",
      "saavutettavuusseloste",
      "akadalymentesseg",
      "acessibilidade",
      "accesibilitate",
      "prisstupnost",
      "dostopnost",
      "pristupacnost",
      "ligipaasetavus",
      "prieinamumas",
      "piekluzamiba",
    ]),
    text: words([
      "accessibility",
      "accessibility statement",
      "barrierefreiheit",
      "erklärung zur barrierefreiheit",
      "přístupnost",
      "prohlášení o přístupnosti",
      "prístupnosť",
      "accessibilité",
      "déclaration d'accessibilité",
      "accesibilidad",
      "declaración de accesibilidad",
      "accessibilità",
      "dichiarazione di accessibilità",
      "toegankelijkheid",
      "toegankelijkheidsverklaring",
      "dostępność",
      "deklaracja dostępności",
      "tillgänglighet",
      "tillgänglighetsredogörelse",
      "tilgængelighed",
      "tilgængelighedserklæring",
      "saavutettavuus",
      "saavutettavuusseloste",
      "akadálymentesség",
      "akadálymentes",
      "acessibilidade",
      "declaração de acessibilidade",
      "accesibilitate",
      "достъпност",
      "προσβασιμότητα",
      "pristupačnost",
      "dostopnost",
      "ligipääsetavus",
      "prieinamumas",
      "piekļūstamība",
      "aċċessibbiltà",
      "inrochtaineacht",
    ]),
  },
};

export const siteOf = (hostname: string): string =>
  hostname.toLowerCase().replace(/^www\./u, "");

const withoutFragment = (url: URL): string => {
  const copy = new URL(url.href);

  copy.hash = "";

  return copy.href;
};

const resolved = (href: string, base: URL): URL | null => {
  if (!URL.canParse(href, base.href)) {
    return null;
  }

  const url = new URL(href, base.href);

  return url.protocol === "http:" || url.protocol === "https:" ? url : null;
};

const matches = (role: CrawlRole, link: LinkEvidence, url: URL): boolean => {
  const signs = ROLE_SIGNS[role];

  return signs.text.test(link.text) || signs.path.test(url.pathname);
};

export const pickPages = (
  pageUrl: string,
  links: readonly LinkEvidence[]
): readonly CrawlPick[] => {
  if (!URL.canParse(pageUrl)) {
    return [];
  }

  const base = new URL(pageUrl);
  const site = siteOf(base.hostname);
  const taken = new Set([withoutFragment(base)]);

  const candidates = links.flatMap((link) => {
    const url = resolved(link.href, base);

    return url !== null && siteOf(url.hostname) === site ? [{ link, url }] : [];
  });

  return CRAWL_ORDER.flatMap((role) => {
    const found = candidates.find(
      ({ link, url }) =>
        !taken.has(withoutFragment(url)) && matches(role, link, url)
    );

    if (found === undefined) {
      return [];
    }

    const url = withoutFragment(found.url);

    taken.add(url);

    return [{ role, url }];
  }).slice(0, CRAWL_PAGES);
};
