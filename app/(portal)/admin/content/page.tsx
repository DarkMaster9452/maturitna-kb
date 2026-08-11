'use client';
import { useState, useEffect, useMemo } from 'react';
import { Icon, Card, Serif, Chip, IconChip, StatCard, EmptyState } from '@/components/ui';
import { Counter } from '@/components/motion';
import { useToastCtx } from '../../layout';
import { AdminHeader, SearchBox } from '../_shared';

type Topic = { id: number; subject_id: number; parent_id: number | null; title: string; subject_name_sk: string; subject_slug: string; subject_icon: string; subject_sort: number };

export default function AdminContentPage() {
  const [data, setData] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { flash } = useToastCtx();

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(setData).catch(() => {});
    fetch('/api/topics').then(r => r.json()).then(d => setTopics(d.topics || [])).catch(() => {});
  }, []);

  // group topics by subject → main topics (with subtopics)
  const bySubject = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; icon: string; sort: number; mains: (Topic & { subs: Topic[] })[]; subCount: number }>();
    const mains = topics.filter(t => t.parent_id == null);
    const subs = topics.filter(t => t.parent_id != null);
    for (const m of mains) {
      if (!map.has(m.subject_slug)) map.set(m.subject_slug, { name: m.subject_name_sk, slug: m.subject_slug, icon: m.subject_icon, sort: m.subject_sort, mains: [], subCount: 0 });
      map.get(m.subject_slug)!.mains.push({ ...m, subs: [] });
    }
    for (const s of subs) {
      const entry = map.get(s.subject_slug);
      if (!entry) continue;
      const parent = entry.mains.find(mm => mm.id === s.parent_id);
      if (parent) { parent.subs.push(s); entry.subCount++; }
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [topics]);

  const totalMain = topics.filter(t => t.parent_id == null).length;
  const totalSub = topics.filter(t => t.parent_id != null).length;
  const filteredSubjects = bySubject.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.mains.some(m => m.title.toLowerCase().includes(search.toLowerCase())));

  const s = data?.stats;
  const actions: [string, string, string][] = [
    ['Pridať predmet', 'add_circle', 'Nový predmet do katalógu'],
    ['Nahrať materiál', 'upload_file', 'PDF, dokument alebo odkaz'],
    ['Vytvoriť test', 'quiz', 'Nový test s otázkami'],
    ['Nový okruh', 'category', 'Maturitná téma alebo podtéma'],
  ];

  return (
    <div>
      <AdminHeader eyebrow="Správa" title="Obsah a učenie" desc="Predmety, okruhy, materiály a testy — celý študijný obsah na jednom mieste."
        action={<Chip tone="soft" icon="school">{s?.subjects || 0} predmetov</Chip>} />

      {/* Summary numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard icon="school" label="Predmety" value={<Counter value={Number(s?.subjects || 0)} />} tone="primary" />
        <StatCard icon="category" label="Okruhy" value={<Counter value={totalMain} />} tone="tertiary" />
        <StatCard icon="account_tree" label="Podokruhy" value={<Counter value={totalSub} />} tone="tertiary" />
        <StatCard icon="upload_file" label="Materiály" value={<Counter value={Number(s?.materials || 0)} />} tone="success" />
        <StatCard icon="quiz" label="Testy" value={<Counter value={Number(s?.tests || 0)} />} tone="primary" />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {actions.map(([label, icon, desc]) => (
          <Card key={label} hover onClick={() => flash(`${label} — čoskoro`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IconChip name={icon} size={44} radius={11} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Subjects table */}
      <Card pad={0} style={{ overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Serif size={20} weight={600}>Predmety a obsah</Serif>
          <Chip tone="soft">{data?.subjectStats?.length || 0} predmetov</Chip>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Predmet', 'Študenti', 'Materiály', 'Testy', ''].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 22px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {(data?.subjectStats || []).map((sj: any, i: number) => (
                <tr key={sj.slug} style={{ borderBottom: i < (data.subjectStats.length - 1) ? '1px solid var(--outline-variant)' : 'none' }}>
                  <td style={{ padding: '11px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <IconChip name={sj.icon} size={34} radius={9} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{sj.name_sk}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.student_count}</td>
                  <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.material_count}</td>
                  <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.test_count}</td>
                  <td style={{ padding: '11px 22px' }}><a href={`/subjects/${sj.slug}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Otvoriť</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Topic tree */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <Serif size={22} weight={600}>Štruktúra okruhov</Serif>
        <SearchBox value={search} onChange={setSearch} placeholder="Hľadať okruh alebo predmet…" width={300} />
      </div>

      {topics.length === 0 ? (
        <Card><EmptyState icon="account_tree" title="Načítavam okruhy…" /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredSubjects.map(subj => {
            const isOpen = open[subj.slug] ?? false;
            return (
              <Card key={subj.slug} pad={0} style={{ overflow: 'hidden' }}>
                <button onClick={() => setOpen(o => ({ ...o, [subj.slug]: !isOpen }))}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <IconChip name={subj.icon} size={40} radius={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700 }}>{subj.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>{subj.mains.length} okruhov · {subj.subCount} podokruhov</div>
                  </div>
                  <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={22} style={{ color: 'var(--on-surface-variant)' }} />
                </button>
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--outline-variant)', padding: '8px 20px 16px' }}>
                    {subj.mains.map(m => (
                      <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: m.subs.length ? 8 : 0 }}>
                          <Icon name="folder" size={18} fill={1} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{m.title}</span>
                          <Chip tone="soft">{m.subs.length}</Chip>
                        </div>
                        {m.subs.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingLeft: 27 }}>
                            {m.subs.map(sub => (
                              <span key={sub.id} style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--on-surface-variant)', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '4px 10px' }}>{sub.title}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {filteredSubjects.length === 0 && <Card><EmptyState icon="search_off" title="Nič sa nenašlo" desc="Skús iný výraz." /></Card>}
        </div>
      )}
    </div>
  );
}
