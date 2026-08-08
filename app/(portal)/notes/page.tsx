'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, Chip, Serif, Eyebrow, SkeletonCard } from '@/components/ui';

type Note = {
  id: number; title: string; content: string; status: string; is_favorite: boolean;
  updated_at: string; subject_name?: string; subject_icon?: string; tags: { id: number; name: string }[];
};

const FILTERS = [
  { id: 'active', label: 'Všetky' },
  { id: 'favorite', label: 'Obľúbené' },
  { id: 'draft', label: 'Koncepty' },
  { id: 'archived', label: 'Archív' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const load = (f = filter, query = q) => {
    setLoading(true);
    fetch(`/api/notes?filter=${f}&q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(d => setNotes(Array.isArray(d) ? d : []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter, q); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => { const t = setTimeout(() => load(filter, q), 300); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q]);

  const newNote = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Nová poznámka' }) });
      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch { setCreating(false); }
  };

  const snippet = (c: string) => c.replace(/[#*`>-]/g, '').replace(/\n+/g, ' ').trim().slice(0, 120);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Tvoje poznámky</Eyebrow>
          <Serif size={44} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0 4px', fontSize: 'clamp(30px, 6vw, 44px)' }}>Poznámky</Serif>
          <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Píš a organizuj vlastné študijné poznámky.</div>
        </div>
        <Button icon="add" onClick={newNote} disabled={creating}>{creating ? 'Vytváram…' : 'Nová poznámka'}</Button>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Icon name="search" size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Hľadať v poznámkach…"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: '10px 14px 10px 38px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '8px 16px', background: filter === f.id ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: filter === f.id ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${filter === f.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)
          : notes.map(n => (
            <Link key={n.id} href={`/notes/${n.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={20} radius={12} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {n.status === 'draft' && <Chip tone="soft">Koncept</Chip>}
                    {n.subject_name && <Chip tone="subject">{n.subject_name}</Chip>}
                  </div>
                  {n.is_favorite && <Icon name="star" size={18} fill={1} style={{ color: '#f59e0b', flex: 'none' }} />}
                </div>
                <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 6 }}>{n.title}</Serif>
                <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', flex: 1, lineHeight: 1.5 }}>{snippet(n.content) || 'Prázdna poznámka'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 8 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {n.tags.slice(0, 3).map(t => <span key={t.id} style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-fixed)', borderRadius: 6, padding: '2px 7px' }}>#{t.name}</span>)}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--tertiary)', whiteSpace: 'nowrap' }}>{new Date(n.updated_at).toLocaleDateString('sk-SK')}</span>
                </div>
              </Card>
            </Link>
          ))}
      </div>

      {!loading && notes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>
          <Icon name="edit_note" size={48} style={{ opacity: .4, display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{q ? 'Nič sa nenašlo' : 'Zatiaľ žiadne poznámky'}</div>
          <div style={{ marginBottom: 20 }}>{q ? 'Skús iný výraz.' : 'Vytvor si svoju prvú poznámku.'}</div>
          {!q && <Button icon="add" onClick={newNote} disabled={creating}>Nová poznámka</Button>}
        </div>
      )}
    </div>
  );
}
