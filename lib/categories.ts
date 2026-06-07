// Built-in okruh (topic) category templates. Used by the okruh creation picker
// and to render each okruh's icon/color. Purely additive — "Vlastný okruh"
// (no category) stays available so structure is never forced.
export type OkruhCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
  metaFields: string[];
};

export const OKRUH_CATEGORIES: OkruhCategory[] = [
  { id: 'definicie', label: 'Definície & pojmy', icon: 'menu_book', color: '#4f46e5', desc: 'Termín a jeho význam — jazyky, biológia, právo, teória.', metaFields: ['term_count', 'language', 'source'] },
  { id: 'vzorce', label: 'Vzorce & rovnice', icon: 'functions', color: '#7c3aed', desc: 'Vzorcové hárky pre MAT, FYZ, CHE.', metaFields: ['formula_count', 'unit_system', 'exam_relevance'] },
  { id: 'casova-os', label: 'Časová os & dátumy', icon: 'timeline', color: '#5b6478', desc: 'Obdobia a sled udalostí — dejepis, literatúra.', metaFields: ['period_from', 'period_to', 'event_count'] },
  { id: 'slovicka', label: 'Slovíčka & frázy', icon: 'translate', color: '#0d9488', desc: 'Slovná zásoba a frázové banky.', metaFields: ['language', 'word_count', 'level'] },
  { id: 'postupy', label: 'Postupy & algoritmy', icon: 'account_tree', color: '#b45309', desc: '„Ako vyriešiť X" — dôkazy, laborky, gramatika, kód.', metaFields: ['difficulty', 'step_count', 'prerequisite'] },
  { id: 'eseje', label: 'Eseje & argumenty', icon: 'history_edu', color: '#9f1239', desc: 'Štruktúrované argumenty, tézy, vzorové eseje.', metaFields: ['thesis', 'word_count', 'stance'] },
  { id: 'diela', label: 'Čítankové diela', icon: 'auto_stories', color: '#6366f1', desc: 'Študijné karty k povinnej literatúre.', metaFields: ['author', 'year', 'genre'] },
];

export const DEFAULT_OKRUH = { id: '', label: 'Vlastný okruh', icon: 'topic', color: '#4f46e5', desc: 'Bez šablóny.' };

export function categoryById(id?: string | null): { icon: string; color: string; label: string } {
  const c = OKRUH_CATEGORIES.find(x => x.id === id);
  return c ? { icon: c.icon, color: c.color, label: c.label } : { icon: DEFAULT_OKRUH.icon, color: DEFAULT_OKRUH.color, label: DEFAULT_OKRUH.label };
}
