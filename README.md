# MaturitaKB

Plnohodnotná webová aplikácia pre prípravu na maturitu — okruhy, materiály, poznámky a testy prehľadne na jednom mieste. Next.js 14 + NeonDB (PostgreSQL).

## Prihlasovacie údaje (demo)

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

Aplikácia má prepracovaný „Aurora" dizajnový systém so **svetlým aj tmavým režimom**.

**Farebná téma**

| Téma | Popis | Farby |
|------|-------|-------|
| Indigo (predvolená) | Moderná indigo/fialová paleta | `#4f46e5` |
| SPSIT | Technická modrá paleta | `#1565c0` |

**Režim**

| Režim | Popis |
|-------|-------|
| Svetlý | Vždy svetlý |
| Tmavý | Vždy tmavý |
| Podľa systému (predvolený) | Rešpektuje nastavenie operačného systému |

Tmavý režim prepneš rýchlo cez ikonu 🌙 v hlavičke/sidebar, alebo detailne v **Nastavenia → Vzhľad**. Výber sa ukladá do `localStorage` a aplikuje sa bez „bliknutia" pri načítaní.

## Funkcie

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
- Inline CSS + CSS custom properties (dizajnový systém „Aurora": Indigo / SPSIT, light / dark)

## Vývoj

```bash
npm install
cp .env.example .env.local   # doplň DATABASE_URL a JWT_SECRET
npm run dev
```
