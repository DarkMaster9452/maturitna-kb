'use client';
import { useState, useEffect } from 'react';
import { Icon, Card, Chip, Serif, Eyebrow, SkeletonCard } from '@/components/ui';
import { BackLink } from '../_components';

type Subject = { id: string; name_sk: string };

export default function ZdrojePage() {
  const [resources, setResources] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/resources').then(r => r.json()).then(d => setResources(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Video: { bg: 'var(--error-container)', c: 'var(--error)' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Audio: { bg: 'var(--warning-container)', c: 'var(--warning)' },
  };
  const shown = filter === 'all' ? resources : resources.filter(r => r.subject_id === filter);

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <BackLink />
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Externé zdroje</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0', fontSize: 'clamp(34px, 7vw, 52px)' }}>Zdroje</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Externé materiály a odporúčané zdroje pre prípravu na maturitu.</div>
      </header>
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === 'all' ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: filter === 'all' ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--outline-variant)'}` }}>Všetky</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === s.id ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: filter === s.id ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${filter === s.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{s.name_sk}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} />)
          : shown.map((r: any) => (
            <Card key={r.id} hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: typeColor[r.type]?.bg || 'var(--primary-fixed)', color: typeColor[r.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name={r.icon} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                  <Chip tone="subject">{r.type}</Chip>
                  {r.badge && <Chip tone="trend">{r.badge}</Chip>}
                </div>
                <Serif size={17} weight={600} style={{ display: 'block', marginBottom: 6 }}>{r.title}</Serif>
                <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{r.description}</div>
              </div>
            </Card>
          ))}
      </div>
      {!loading && shown.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>Zatiaľ tu nie sú žiadne zdroje.</div>
      )}
    </div>
  );
}
