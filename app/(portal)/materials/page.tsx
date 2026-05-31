'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Card, IconChip, Chip, Serif, Eyebrow } from '@/components/ui';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  const filtered = materials.filter(m => {
    const matchSubject = filter === 'all' || m.subject_id === filter;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const typeColor: Record<string, any> = {
    Notes: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Test: { bg: '#ffdad6', c: 'var(--error)' },
    Reading: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Guide: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
    Reference: { bg: 'var(--surface-container-high)', c: 'var(--on-surface)' },
    Audio: { bg: '#dcedf5', c: '#1a6b8a' },
  };

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Databáza vedomostí</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Materiály</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Každá maturitná téma, usporiadaná do logických celkov.</div>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Icon name="search" size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hľadať materiály…"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: '9px 14px 9px 38px', color: 'var(--on-surface)', outline: 'none', width: '100%' }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(132,79,34,.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
        </div>
        {/* Filters */}
        <button onClick={() => setFilter('all')} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === 'all' ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === 'all' ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--outline-variant)'}` }}>Všetky</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === s.id ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === s.id ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === s.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{s.name_sk}</button>
        ))}
      </div>

      <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--on-surface-variant)' }}>{filtered.length} materiálov</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {filtered.map((m: any) => (
          <Link key={m.id} href={`/materials/${m.id}`} style={{ textDecoration: 'none' }}>
            <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: typeColor[m.type]?.bg || 'var(--primary-fixed)', color: typeColor[m.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name={m.icon} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 6 }}>
                  <Chip tone="subject">{m.type}</Chip>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.is_new && <Chip tone="trend">Nové</Chip>}
                    <span style={{ fontSize: 12, color: 'var(--tertiary)', whiteSpace: 'nowrap' }}>{new Date(m.updated_at || m.created_at).toLocaleDateString('sk-SK')}</span>
                  </div>
                </div>
                <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 6 }}>{m.title}</Serif>
                <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name_sk} · {m.meta}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>
          <Icon name="search_off" size={48} style={{ opacity: .4, display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Žiadne materiály</div>
          <div>Skús zmeniť filter alebo vyhľadávací výraz.</div>
        </div>
      )}
    </div>
  );
}
