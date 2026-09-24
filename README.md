# MaturitaKB — koncept

> **⚠️ Toto je koncept (prototyp / proof of concept), nie hotový produkt.**
> Repozitár ukazuje *nápad*, ako by mohla vyzerať webová aplikácia na prípravu na maturitu —
> okruhy, materiály, poznámky a testy prehľadne na jednom mieste.
> Obsah, účty, štatistiky aj „achievementy" sú **ukážkové**. Aplikácia nie je určená na
> produkčné nasadenie, nie je bezpečnostne auditovaná a funkcie môžu byť nedokončené alebo sa môžu zmeniť.

Postavené na Next.js 14 + NeonDB (PostgreSQL).

## Stav konceptu

| Oblasť | Stav |
|--------|------|
| UI / dizajn (Editorial / Ink) | návrh — hotový na ukážku |
| Okruhy, materiály, poznámky, testy | funkčné na ukážkových dátach |
| Roly (študent / učiteľ / admin / vlastník) | demonštrácia oprávnení |
| Registrácia, obnova hesla, notifikácie | iba naznačené, nefunkčné |
| Bezpečnosť, škálovanie, GDPR | neriešené — mimo rozsahu konceptu |

V aplikácii je stav konceptu viditeľný všade: pás „Koncept" na úvodnej stránke,
štítok pri logu a poznámka v portáli.

## Demo účty

| Rola | E-mail | Heslo |
|------|--------|-------|
| Administrátor | admin@skola.sk | heslo123 |
| Študent | martin@skola.sk | heslo123 |

Na prihlasovacej stránke sú tlačidlá **Demo prístup** na rýchle vyplnenie údajov.

## Roly a oprávnenia

| Rola | Dashboard | Materiály | Testy | Učiteľský panel | Admin panel | Vlastnícky panel |
|------|-----------|-----------|-------|-----------------|-------------|------------------|
| Študent | ✓ | ✓ (čítanie) | ✓ | — | — | — |
| Učiteľ | ✓ | ✓ (editácia) | ✓ (tvorba) | ✓ | — | — |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Vlastník | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (správa rôl) |

## Vzhľad

Dizajnový smer **„Editorial / Ink"** — monochromatická paper/ink paleta, hairline okraje,
jeden striedmy akcent (emerald, alternatívne SPSIT modrá). Svetlý, tmavý a systémový režim;
prepínanie v hlavičke alebo v **Nastavenia → Vzhľad**.

## Funkcie (navrhované v koncepte)

- **Úvodná stránka** — hero s ukážkou produktu, prehľad funkcií, „ako to funguje" a výzva na akciu
- **Prihlásenie** — JWT session (httpOnly cookie), demo prístup, svetlý/tmavý režim
- **Onboarding** — výber predmetov pri prvom prihlásení
- **Dashboard** — štatistiky, pripnuté predmety s kruhovým pokrokom, nedávna aktivita
- **Predmety** — výber, pripnutie do sidebaru, detailná stránka s okruhmi
- **Materiály** — filter, vyhľadávanie, detail
- **Poznámky** — editor s autosave, štítky, koncepty, archív, obľúbené
- **Zdroje** — filter, detail
- **Testy** — interaktívny kvíz, ukladanie výsledkov do DB
- **Môj pokrok** — grafy, odznaky, prehľad predmetov
- **Učiteľský / Admin / Vlastnícky panel** — správa obsahu, štatistiky, správa rôl
- **Nastavenia** — profil, výber predmetov, notifikácie, vzhľad (téma + režim)

## Stack

- Next.js 14 (App Router)
- NeonDB PostgreSQL (`@neondatabase/serverless`)
- JWT auth (`jose`)
- Inline CSS + CSS custom properties (dizajnový systém „Editorial / Ink": Emerald / SPSIT, light / dark)

## Vývoj

```bash
npm install
cp .env.example .env.local   # doplň DATABASE_URL a JWT_SECRET
npm run dev
```

## Licencia a použitie

Ide o študentský koncept na ukážku nápadu. Nepoužívaj ho so skutočnými osobnými údajmi
ani ako produkčnú aplikáciu.
