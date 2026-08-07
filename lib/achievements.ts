// Achievement catalogue. Purely derived from the user's own stats — no fabricated data.
export type AchStat = {
  testCount: number;
  bestScore: number;
  avgProgress: number;
  subjectsCount: number;
  sessionsCount: number;
  totalHours: number;
  perfectCount: number;
};

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
  have: number;
  need: number;
  tier: 'bronze' | 'silver' | 'gold';
};

export function computeAchievements(s: AchStat): Achievement[] {
  const mk = (id: string, icon: string, title: string, desc: string, have: number, need: number, tier: Achievement['tier']): Achievement =>
    ({ id, icon, title, desc, earned: have >= need, have: Math.min(have, need), need, tier });

  return [
    // Testy
    mk('t1', 'rocket_launch', 'Prvý krok', 'Dokonči svoj prvý cvičný test.', s.testCount, 1, 'bronze'),
    mk('t5', 'quiz', 'Rozbeh', 'Dokonči 5 testov.', s.testCount, 5, 'bronze'),
    mk('t10', 'workspace_premium', 'Testovací maratón', 'Dokonči 10 testov.', s.testCount, 10, 'silver'),
    mk('t25', 'military_tech', 'Neúnavný', 'Dokonči 25 testov.', s.testCount, 25, 'gold'),
    // Skóre
    mk('s80', 'trending_up', 'Nad priemer', 'Dosiahni skóre aspoň 80 %.', s.bestScore, 80, 'bronze'),
    mk('s90', 'star', 'Špička', 'Dosiahni skóre aspoň 90 %.', s.bestScore, 90, 'silver'),
    mk('perfect', 'auto_awesome', 'Bezchybný', 'Získaj 100 % v teste.', s.perfectCount, 1, 'gold'),
    // Pokrok
    mk('p50', 'donut_large', 'Polovica cesty', 'Priemerný pokrok 50 %.', s.avgProgress, 50, 'bronze'),
    mk('p75', 'insights', 'Takmer tam', 'Priemerný pokrok 75 %.', s.avgProgress, 75, 'silver'),
    mk('p90', 'verified', 'Pripravený na maturitu', 'Priemerný pokrok 90 %.', s.avgProgress, 90, 'gold'),
    // Predmety
    mk('sub1', 'bookmark_added', 'Začiatok', 'Pridaj si prvý predmet.', s.subjectsCount, 1, 'bronze'),
    mk('sub3', 'library_books', 'Všestranný', 'Maj v pláne 3 predmety.', s.subjectsCount, 3, 'silver'),
    mk('sub5', 'school', 'Ambiciózny', 'Maj v pláne 5 predmetov.', s.subjectsCount, 5, 'gold'),
    // Štúdium
    mk('ses1', 'timer', 'Prvá session', 'Dokonči prvú študijnú session.', s.sessionsCount, 1, 'bronze'),
    mk('ses10', 'local_fire_department', 'V zabehu', 'Dokonči 10 sessions.', s.sessionsCount, 10, 'silver'),
    mk('ses25', 'bolt', 'Vytrvalec', 'Dokonči 25 sessions.', s.sessionsCount, 25, 'gold'),
    mk('h10', 'schedule', '10 hodín', 'Naštuduj 10 hodín.', s.totalHours, 10, 'bronze'),
    mk('h50', 'hourglass_top', '50 hodín', 'Naštuduj 50 hodín.', s.totalHours, 50, 'gold'),
  ];
}
