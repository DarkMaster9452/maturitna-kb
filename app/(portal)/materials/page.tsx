'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Card, IconChip, Serif, Eyebrow, Chip, EmptyState, Skeleton } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { useT, subjectName } from '@/components/i18n';

type Topic = { id: number; subject_id: string; parent_id: number | null; title: string; description?: string; icon?: string; category?: string; subject_name_sk: string; subject_name_en?: string; subject_slug: string; subject_icon: string; subject_sort: number };

const podtemy = (n: number) => n === 1 ? 'podtéma' : n < 5 ? 'podtémy' : 'podtém';

export default function MaterialsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<number>>(new Set());
  const { t, lang } = useT();

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(d => setTopics(Array.isArray(d.topics) ? d.topics : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const mains = topics.filter(x => x.parent_id == null);
  const subsByParent: Record<number, Topic[]> = {};
  topics.filter(x => x.parent_id != null).forEach(x => { (subsByParent[x.parent_id as number] = subsByParent[x.parent_id as number] || []).push(x); });

  // subjects present
  const subjMap: Record<string, Topic> = {};
  topics.forEach(x => { if (!subjMap[x.subject_slug]) subjMap[x.subject_slug] = x; });
  const subjects = Object.values(subjMap).sort((a, b) => a.subject_sort - b.subject_sort);
  const subjName = (x: Topic) => subjectName({ name_sk: x.subject_name_sk, name_en: x.subject_name_en }, lang);

  const query = q.trim().toLowerCase();
  const toggle = (id: number) => setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // build visible structure per subject
  const shownSubjects = subjects.filter(s => subject === 'all' || s.subject_slug === subject);
  const buildMains = (subjectId: string) => {
    return mains.filter(m => m.subject_id === subjectId).map(m => {
      const subs = subsByParent[m.id] || [];
      if (!query) return { m, subs, expanded: open.has(m.id) };
      const mainMatch = m.title.toLowerCase().includes(query) || (m.description || '').toLowerCase().includes(query);
      const subMatches = subs.filter(su => su.title.toLowerCase().includes(query));
      if (mainMatch) return { m, subs, expanded: true };
      if (subMatches.length) return { m, subs: subMatches, expanded: true };
      return null;
    }).filter(Boolean) as { m: Topic; subs: Topic[]; expanded: boolean }[];
  };

  const totalTopics = mains.length;
  const totalSubs = topics.length - mains.length;

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <Eyebrow icon="menu_book">{t('Databáza vedomostí')}</Eyebrow>
        <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>{t('Materiály')}</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>{t('Študijné okruhy a podtémy — od hlavných tém k detailom.')}</div>
      </header>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Hľadať tému alebo podtému…')}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }} className="mkb-hide-mobile">{totalTopics} {t('tém')} · {totalSubs} {t('podtém')}</span>
      </div>
      <div className="mkb-rail mkb-rail-wrap" style={{ gap: 8, marginBottom: 24 }}>
        <button onClick={() => setSubject('all')} style={chip(subject === 'all')}>{t('Všetky')}</button>
        {subjects.map(s => (
          <button key={s.subject_slug} onClick={() => setSubject(s.subject_slug)} style={chip(subject === s.subject_slug)}>
            <Icon name={s.subject_icon} size={16} fill={subject === s.subject_slug ? 1 : 0} />{subjName(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[0, 1, 2, 3, 4].map(i => <Skeleton key={i} height={60} radius={12} />)}</div>
      ) : (() => {
        const groups = shownSubjects.map(s => ({ s, items: buildMains(s.subject_id) })).filter(g => g.items.length);
        if (!groups.length) return <EmptyState icon="search_off" title={t('Nič sa nenašlo')} desc={t('Skús iný výraz alebo predmet.')} />;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {groups.map(({ s, items }) => (
              <div key={s.subject_slug}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <IconChip name={s.subject_icon} size={38} radius={11} grad />
                  <div>
                    <Serif size={22} weight={600} style={{ display: 'block' }}>{subjName(s)}</Serif>
                    <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>{items.length} {t('tém')}</div>
                  </div>
                  <Link href={`/subjects/${s.subject_slug}`} style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }} className="mkb-hide-mobile">
                    {t('Otvoriť predmet')} <Icon name="arrow_forward" size={15} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(({ m, subs, expanded }, i) => (
                    <Reveal key={m.id} delay={Math.min(i * 20, 200)}>
                      <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 14, background: 'var(--surface-container-lowest)', overflow: 'hidden' }}>
                        <button onClick={() => toggle(m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={m.icon || 'topic'} size={22} fill={1} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</div>
                            {m.description && <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>}
                          </div>
                          <span className="mkb-hide-mobile" style={{ flex: 'none' }}><Chip tone="soft">{subs.length} {podtemy(subs.length)}</Chip></span>
                          <span className="mkb-only-mobile" style={{ flex: 'none' }}><Chip tone="soft">{subs.length}</Chip></span>
                          <Icon name={expanded ? 'expand_less' : 'expand_more'} size={22} style={{ color: 'var(--on-surface-variant)', flex: 'none' }} />
                        </button>
                        {expanded && subs.length > 0 && (
                          <div style={{ padding: '4px 16px 14px', paddingLeft: 'clamp(16px, 8vw, 70px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                            {subs.map(su => (
                              <div key={su.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 10, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
                                <Icon name="subdirectory_arrow_right" size={16} style={{ color: 'var(--primary)', flex: 'none' }} />
                                <span style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{su.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

function chip(active: boolean): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', background: active ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: active ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}` };
}
