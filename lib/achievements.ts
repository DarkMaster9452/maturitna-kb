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
  group: string;
};

export function computeAchievements(s: AchStat): Achievement[] {
  const out: Achievement[] = [];
  const tierFor = (i: number, n: number): Achievement['tier'] => (i < Math.ceil(n / 3) ? 'bronze' : i < Math.ceil((2 * n) / 3) ? 'silver' : 'gold');
  const add = (id: string, icon: string, title: string, desc: string, have: number, need: number, tier: Achievement['tier'], group: string) =>
    out.push({ id, icon, title, desc, earned: have >= need, have: Math.min(have, need), need, tier, group });

  const testT = [1, 3, 5, 10, 15, 25, 40, 60, 100, 150, 200];
  testT.forEach((n, i) => add('t' + n, 'quiz', n === 1 ? 'Prvý test' : `${n} testov`, `Dokonči ${n} ${n === 1 ? 'test' : 'testov'}.`, s.testCount, n, tierFor(i, testT.length), 'Testy'));

  const scoreT = [50, 60, 70, 80, 85, 90, 95, 100];
  scoreT.forEach((n, i) => add('sc' + n, 'star', `Skóre ${n} %+`, `Dosiahni skóre aspoň ${n} % v teste.`, s.bestScore, n, tierFor(i, scoreT.length), 'Skóre'));

  const perfT = [1, 3, 5, 10];
  perfT.forEach((n, i) => add('pf' + n, 'auto_awesome', n === 1 ? 'Bezchybný' : `${n}× stopercentný`, `Získaj 100 % v ${n} ${n === 1 ? 'teste' : 'testoch'}.`, s.perfectCount, n, tierFor(i, perfT.length), 'Skóre'));

  const progT = [10, 25, 40, 50, 60, 75, 85, 90, 95, 100];
  progT.forEach((n, i) => add('pg' + n, 'trending_up', `Pokrok ${n} %`, `Dosiahni priemerný pokrok ${n} %.`, s.avgProgress, n, tierFor(i, progT.length), 'Pokrok'));

  const subT = [1, 2, 3, 4, 5, 6, 8, 10];
  subT.forEach((n, i) => add('su' + n, 'school', n === 1 ? 'Prvý predmet' : `${n} predmetov`, `Maj v pláne ${n} ${n === 1 ? 'predmet' : 'predmetov'}.`, s.subjectsCount, n, tierFor(i, subT.length), 'Predmety'));

  const sesT = [1, 3, 5, 10, 15, 25, 40, 60, 100, 150];
  sesT.forEach((n, i) => add('se' + n, 'timer', n === 1 ? 'Prvá session' : `${n} sessions`, `Dokonči ${n} ${n === 1 ? 'študijnú session' : 'sessions'}.`, s.sessionsCount, n, tierFor(i, sesT.length), 'Štúdium'));

  const hourT = [5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500];
  hourT.forEach((n, i) => add('h' + n, 'schedule', `${n} hodín`, `Naštuduj ${n} hodín.`, s.totalHours, n, tierFor(i, hourT.length), 'Štúdium'));

  // combos
  add('c1', 'military_tech', 'Expert', 'Skóre 90 %+ a 10 dokončených testov.', (s.bestScore >= 90 && s.testCount >= 10) ? 1 : 0, 1, 'gold', 'Výzvy');
  add('c2', 'balance', 'Vyvážený', '3 predmety a priemerný pokrok 50 %.', (s.subjectsCount >= 3 && s.avgProgress >= 50) ? 1 : 0, 1, 'silver', 'Výzvy');
  add('c3', 'local_fire_department', 'Rozbeh', '5 testov a 5 sessions.', (s.testCount >= 5 && s.sessionsCount >= 5) ? 1 : 0, 1, 'bronze', 'Výzvy');
  add('c4', 'emoji_events', 'Maratónec', '100 hodín a 25 sessions.', (s.totalHours >= 100 && s.sessionsCount >= 25) ? 1 : 0, 1, 'gold', 'Výzvy');
  add('c5', 'verified', 'Maturant', 'Pokrok 90 % a 25 testov.', (s.avgProgress >= 90 && s.testCount >= 25) ? 1 : 0, 1, 'gold', 'Výzvy');
  add('c6', 'bolt', 'Naštartovaný', 'Prvý test alebo prvá session.', (s.testCount >= 1 || s.sessionsCount >= 1) ? 1 : 0, 1, 'bronze', 'Výzvy');
  add('c7', 'workspace_premium', 'Kompletista', 'Priemerný pokrok 100 %.', s.avgProgress >= 100 ? 1 : 0, 1, 'gold', 'Výzvy');
  add('c8', 'psychology', 'Všestranný', '5 predmetov a 20 hodín štúdia.', (s.subjectsCount >= 5 && s.totalHours >= 20) ? 1 : 0, 1, 'silver', 'Výzvy');
  add('c9', 'diversity_3', 'Nadšenec', '3 predmety, 3 testy, 3 sessions.', (s.subjectsCount >= 3 && s.testCount >= 3 && s.sessionsCount >= 3) ? 1 : 0, 1, 'silver', 'Výzvy');
  add('c10', 'rocket_launch', 'Na plný plyn', '50 hodín a pokrok 75 %.', (s.totalHours >= 50 && s.avgProgress >= 75) ? 1 : 0, 1, 'gold', 'Výzvy');

  return out;
}
