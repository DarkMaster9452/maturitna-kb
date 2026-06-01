# Maturita KB

Plnohodnotná webová aplikácia pre prípravu na maturitu. Next.js 14 + NeonDB (PostgreSQL).

## Prihlasovacie údaje (demo)

| Rola | E-mail | Heslo |
|------|--------|-------|
| Vlastník | owner@skola.sk | heslo123 |
| Administrátor | admin@skola.sk | heslo123 |
| Učiteľ | ucitel@skola.sk | heslo123 |
| Študent (Martin Straňanek) | martin@skola.sk | heslo123 |

## Roly a oprávnenia

| Rola | Dashboard | Materiály | Testy | Učiteľský panel | Admin panel | Vlastnícky panel |
|------|-----------|-----------|-------|-----------------|-------------|------------------|
| Študent | ✓ | ✓ (čítanie) | ✓ | — | — | — |
| Učiteľ | ✓ | ✓ (editácia) | ✓ (tvorba) | ✓ | — | — |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Vlastník | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (správa rôl) |

## Témy

| Téma | Popis | Farby |
|------|-------|-------|
| Academic Hearth (predvolená) | Teplá hnedá paleta, serif nadpisy | `#844f22` hnedá |
| SPSIT | Inšpirovaná SPSKNM Nové Mesto, technická modrá paleta | `#1565c0` modrá |

Tému prepneš v **Nastavenia → Vzhľad**.

## Funkcie

- Úvodná stránka s tabmi: Študijný hub, Zdroje, Predmety, Rozvrh
- Prihlásenie s JWT session (httpOnly cookie)
- Onboarding — výber predmetov pri prvom prihlásení
- Dashboard s pripnutými predmetmi a aktivitou
- Predmety — výber, pripnutie do sidebaru, detail stránka
- Materiály — filter, vyhľadávanie, detail
- Zdroje — filter, detail
- Testy — interaktívny kvíz, ukladanie výsledkov do DB
- Môj pokrok — grafy, odznaky, prehľad predmetov
- Učiteľský panel — správa materiálov a testov
- Admin panel — štatistiky, aktivita, rýchle akcie
- Vlastnícky panel — správa rôl všetkých používateľov
- Nastavenia — profil, výber predmetov, notifikácie, téma

## Stack

- Next.js 14 (App Router)
- NeonDB PostgreSQL (`@neondatabase/serverless`)
- JWT auth (`jose`)
- Inline CSS (témy: Academic Hearth, SPSIT)
