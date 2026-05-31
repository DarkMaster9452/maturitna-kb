# Maturita KB — Martin Straňanek

Plnohodnotná webová aplikácia pre prípravu na maturitu. Next.js 14 + NeonDB (PostgreSQL).

## Spustenie

```bash
npm install
npm run dev
```

Otvor http://localhost:3000

## Prihlasovacie údaje (demo)

| Rola | E-mail | Heslo |
|------|--------|-------|
| Študent (Martin Straňanek) | martin@skola.sk | heslo123 |
| Administrátor | admin@skola.sk | heslo123 |

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
- Admin panel — štatistiky, aktivita, rýchle akcie
- Nastavenia — profil, výber predmetov, notifikácie
- Podpora — FAQ, kontaktný formulár

## Stack

- Next.js 14 (App Router)
- NeonDB PostgreSQL (`@neondatabase/serverless`)
- JWT auth (`jose`)
- Inline CSS (design system "Academic Hearth")
