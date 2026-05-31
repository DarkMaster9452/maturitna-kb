'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Card, IconChip, Chip, Serif, Eyebrow } from '@/components/ui';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(setResources);
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  const filtered = resources.filter(r => {
    const matchSubject = filter === 'all' || r.subject_id === filter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)', icon: 'picture_as_pdf' },
    Video: { bg: '#dcedf5', c: '#1a6b8a', icon: 'play_circle' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)', icon: 'public' },
    Audio: { bg: 'var(--secondary-container)', c: 'var(--secondary)', icon: 'headphones' },
  };

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Externé zdroje</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Zdroje</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Externé materiály a odporúčané zdroje pre prípravu na maturitu.</div>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Icon name="search" size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hľadať zdroje…"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: '9px 14px 9px 38px', color: 'var(--on-surface)', outline: 'none', width: '100%' }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(132,79,34,.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
        </div>
        <button onClick={() => setFilter('all')} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === 'all' ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === 'all' ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--outline-variant)'}` }}>Všetky</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === s.id ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === s.id ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === s.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{s.name_sk}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {filtered.map((r: any) => (
          <Link key={r.id} href={`/resources/${r.id}`} style={{ textDecoration: 'none' }}>
            <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: typeColor[r.type]?.bg || 'var(--primary-fixed)', color: typeColor[r.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name={r.icon} size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                  <Chip tone="subject">{r.type}</Chip>
                  {r.badge && <Chip tone="trend">{r.badge}</Chip>}
                </div>
                <Serif size={17} weight={600} style={{ display: 'block', marginBottom: 6 }}>{r.title}</Serif>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 8 }}>{r.description}</div>
                {r.name_sk && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{r.name_sk}</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
