'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Icon } from '@/components/ui';

export type Lang = 'sk' | 'en';

// English overrides keyed by the Slovak source string. Missing keys fall back to Slovak.
const EN: Record<string, string> = {
  // shell / nav
  'Dashboard': 'Dashboard', 'Materiály': 'Materials', 'Poznámky': 'Notes', 'Testy': 'Tests',
  'Môj pokrok': 'My progress', 'Moja trieda': 'My class', 'Admin panel': 'Admin panel',
  'Vlastník': 'Owner', 'Nastavenia': 'Settings', 'Podpora': 'Support',
  'Spustiť session': 'Start session', 'Spravovať predmety': 'Manage subjects',
  'Pripnuté predmety': 'Pinned subjects', 'Hlavné': 'Main', 'Správa': 'Manage',
  'Študentský portál': 'Student portal', 'Administrácia': 'Administration',
  'Odhlásiť sa': 'Log out', 'Domov': 'Home', 'Predmety': 'Subjects',
  // roles
  'Študent': 'Student', 'Učiteľ': 'Teacher', 'Administrátor': 'Administrator', 'Používateľ': 'User',
  // settings
  'Účet': 'Account', 'Profil': 'Profile', 'Vzhľad': 'Appearance', 'Jazyk': 'Language',
  'Farebná téma': 'Color accent', 'Režim': 'Mode', 'Svetlý': 'Light', 'Tmavý': 'Dark',
  'Podľa systému': 'System', 'Moje predmety': 'My subjects', 'Notifikácie': 'Notifications',
  'Bezpečnosť': 'Security', 'Trieda': 'Class', 'Uložiť zmeny': 'Save changes',
  'Celé meno': 'Full name', 'E-mailová adresa': 'Email address',
  'Prispôsob si farebnú tému a svetlý či tmavý režim.': 'Customise your color accent and light or dark mode.',
  'Vyber jazyk aplikácie.': 'Choose the app language.',
  'Slovenčina': 'Slovak', 'Angličtina': 'English', 'Predvolený': 'Default', 'Druhý jazyk': 'Second language',
  'Pripoj sa k učiteľovi pomocou pozývacieho kódu, ktorý ti dá.': 'Join a teacher using the invite code they give you.',
  'Pozývací kód': 'Invite code', 'Pripojiť sa': 'Join', 'Tvoji učitelia': 'Your teachers',
  // marketing nav / hero
  'Domov ': 'Home', 'Zdroje': 'Resources', 'Rozvrh': 'Schedule', 'Prihlásiť sa': 'Sign in',
  'Vstúpiť do databázy': 'Enter the database', 'Preskúmať predmety': 'Explore subjects',
  'Tvoja cesta k úspešnej': 'Your path to a successful', 'maturite': 'matura', 'začína tu.': 'starts here.',
  'Všetko pre tvoju maturitu na jednom mieste': 'Everything for your matura in one place',
  'Kam ďalej?': 'Where to next?', 'Preskúmaj': 'Explore', 'Čo tu nájdeš': 'What you get',
  'Ako to funguje': 'How it works', 'Tri kroky k pripravenosti': 'Three steps to readiness',
  'Pripravený začať?': 'Ready to start?', 'Začni ešte dnes': 'Start today',
  'Pripravíme ťa na': 'We prepare you for', 'Preskúmať predmety': 'Explore subjects',
  'Organizuj si okruhy, materiály a poznámky, precvičuj cvičné testy a sleduj svoj pokrok — prehľadne, moderne a efektívne.':
    'Organise your topics, materials and notes, practise mock tests and track your progress — clean, modern and effective.',
  'Všetko, čo na maturitu potrebuješ': 'Everything you need for the matura',
  'Nástroje navrhnuté tak, aby si sa mohol sústrediť na učenie — nie na organizovanie chaosu v priečinkoch.':
    'Tools designed so you can focus on learning — not on organising chaos in folders.',
  'Prihlás sa, vyber si predmety a maj celú prípravu na maturitu pod kontrolou.':
    'Sign in, pick your subjects and keep your whole matura prep under control.',
  'Maturitných predmetov': 'Matura subjects', 'Typov okruhov': 'Topic types', 'Zdarma pre študentov': 'Free for students',
  // progress
  'Analytika': 'Analytics', 'Môj pokrok': 'My progress',
  'Sleduj hodiny štúdia, výsledky testov a zvládnutie predmetov.': 'Track study hours, test results and subject mastery.',
  'Celkový pokrok': 'Overall progress', 'Celkové hodiny': 'Total hours', 'Dokončené testy': 'Completed tests',
  'Odznaky': 'Badges', 'Aktívne predmety': 'Active subjects', 'Skóre v čase': 'Score over time',
  'Hodiny štúdia': 'Study hours', 'Zvládnutie predmetov': 'Subject mastery',
  'Zatiaľ žiadne výsledky': 'No results yet', 'Žiadne sessions': 'No sessions', 'Žiadne dáta o pokroku': 'No progress data',
  'Achievementy': 'Achievements', 'odomknutých odznakov': 'badges unlocked', 'Posledné výsledky testov': 'Recent test results',
  // materials / topics
  'Databáza vedomostí': 'Knowledge base', 'Študijné okruhy a podtémy — od hlavných tém k detailom.': 'Study topics and subtopics — from main themes to details.',
  'Hľadať tému alebo podtému…': 'Search a topic or subtopic…', 'Všetky': 'All', 'tém': 'topics', 'podtém': 'subtopics',
  'Nič sa nenašlo': 'Nothing found', 'Skús iný výraz alebo predmet.': 'Try another term or subject.', 'Otvoriť predmet': 'Open subject',
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string };
const LangContext = createContext<Ctx>({ lang: 'sk', setLang: () => {}, t: (s) => s });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sk');
  useEffect(() => {
    try { const l = localStorage.getItem('lang'); if (l === 'en') setLangState('en'); } catch {}
  }, []);
  const setLang = (l: Lang) => { try { localStorage.setItem('lang', l); } catch {} setLangState(l); };
  const t = (s: string) => (lang === 'en' ? (EN[s] ?? s) : s);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useT() { return useContext(LangContext); }
export function useLang() { return useContext(LangContext); }

export function subjectName(s: any, lang: Lang): string {
  if (!s) return '';
  return lang === 'en' ? (s.name_en || s.name_sk) : s.name_sk;
}

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <button onClick={() => setLang(lang === 'sk' ? 'en' : 'sk')} title={lang === 'sk' ? 'Switch to English' : 'Prepnúť na slovenčinu'} aria-label="Language"
      style={{ height: compact ? 38 : 40, padding: '0 12px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em', transition: 'color .2s, border-color .2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--outline)'; e.currentTarget.style.color = 'var(--on-surface)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}>
      <Icon name="language" size={18} />{lang.toUpperCase()}
    </button>
  );
}
