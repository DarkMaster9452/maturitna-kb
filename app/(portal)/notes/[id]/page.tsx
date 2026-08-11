'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, Serif, Skeleton, useMediaQuery } from '@/components/ui';
import { useToastCtx } from '../../layout';

function renderMarkdown(text: string) {
  if (!text.trim()) return <div style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Náhľad sa zobrazí, keď začneš písať…</div>;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700, margin: '0 0 20px' }}>{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 21, fontWeight: 600, margin: '26px 0 10px' }}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 16, fontWeight: 700, margin: '18px 0 6px' }}>{line.slice(4)}</h3>;
    if (line.startsWith('- ')) return <div key={i} style={{ display: 'flex', gap: 8, margin: '4px 0', paddingLeft: 6 }}><Icon name="circle" size={7} fill={1} style={{ color: 'var(--primary)', marginTop: 8, flex: 'none' }} /><span>{line.slice(2)}</span></div>;
    if (line === '') return <div key={i} style={{ height: 10 }} />;
    return <p key={i} style={{ margin: '6px 0', color: 'var(--on-surface)' }}>{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
  });
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { flash } = useToastCtx();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [status, setStatus] = useState('draft');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState<string>('');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const timer = useRef<any>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/notes/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(n => {
        setNote(n); setTitle(n.title); setContent(n.content || '');
        setIsFav(n.is_favorite); setStatus(n.status);
        setTags((n.tags || []).map((t: any) => t.name));
        setTimeout(() => { loadedRef.current = true; }, 50);
      })
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const save = useCallback(async (patch: any) => {
    setSaveState('saving');
    try {
      await fetch(`/api/notes/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      setSaveState('saved');
      setSavedAt(new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }));
    } catch { setSaveState('idle'); flash('Nepodarilo sa uložiť'); }
  }, [params.id, flash]);

  // debounced autosave on title/content
  useEffect(() => {
    if (!loadedRef.current) return;
    setSaveState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save({ title, content }), 800);
    return () => clearTimeout(timer.current);
  }, [title, content, save]);

  const immediate = (patch: any) => save(patch);

  const toggleFav = () => { const v = !isFav; setIsFav(v); immediate({ is_favorite: v }); };
  const togglePublish = () => { const v = status === 'draft' ? 'published' : 'draft'; setStatus(v); immediate({ status: v }); flash(v === 'published' ? 'Publikované' : 'Uložené ako koncept'); };
  const archive = () => { immediate({ archived: true }); flash('Presunuté do archívu'); router.push('/notes'); };
  const del = async () => { await fetch(`/api/notes/${params.id}`, { method: 'DELETE' }); flash('Poznámka zmazaná'); router.push('/notes'); };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 12) { const nt = [...tags, t]; setTags(nt); immediate({ tags: nt }); }
    setTagInput('');
  };
  const removeTag = (t: string) => { const nt = tags.filter(x => x !== t); setTags(nt); immediate({ tags: nt }); };

  if (loading) return <div style={{ maxWidth: 760 }}><Skeleton width="50%" height={32} style={{ marginBottom: 20 }} /><Skeleton height={400} radius={12} /></div>;
  if (!note) return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>
      <Icon name="error_outline" size={48} style={{ opacity: .4, display: 'block', margin: '0 auto 16px' }} />
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Poznámka sa nenašla</div>
      <Link href="/notes" style={{ color: 'var(--primary)', fontWeight: 600 }}>Späť na poznámky</Link>
    </div>
  );

  const saveLabel = saveState === 'saving' ? 'Ukladám…' : saveState === 'saved' ? `Uložené ${savedAt}` : 'Automatické ukladanie';

  const editor = (
    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={"Začni písať… (podporuje Markdown: # nadpis, - odrážka, **tučné**)"}
      style={{ width: '100%', minHeight: isMobile ? '50vh' : 460, resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7, color: 'var(--on-surface)', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 20, outline: 'none' }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }} onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; }} />
  );
  const preview = (
    <Card pad={24} radius={12} style={{ minHeight: isMobile ? '50vh' : 460, fontSize: 16, lineHeight: 1.7 }}>{renderMarkdown(content)}</Card>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/notes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)' }}>
          <Icon name="arrow_back" size={18} /> Poznámky
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 2 }}>
            <Icon name={saveState === 'saving' ? 'sync' : 'cloud_done'} size={15} /> {saveLabel}
          </span>
          <button onClick={toggleFav} title="Obľúbené" className="mkb-tap" style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#f59e0b' : 'var(--on-surface-variant)', padding: 6, display: 'flex' }}><Icon name="star" size={20} fill={isFav ? 1 : 0} /></button>
          <Button variant="secondary" onClick={togglePublish}>{status === 'draft' ? 'Publikovať' : 'Koncept'}</Button>
          <button onClick={archive} title="Archivovať" className="mkb-tap" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, display: 'flex' }}><Icon name="archive" size={20} /></button>
          <button onClick={del} title="Zmazať" className="mkb-tap" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 6, display: 'flex' }}><Icon name="delete" size={20} /></button>
        </div>
      </div>

      {/* Title */}
      {/* `mkb-bigtext` opts out of the global 16px mobile input floor */}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Názov poznámky" className="mkb-bigtext"
        style={{ width: '100%', fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, color: 'var(--on-surface)', background: 'none', border: 'none', outline: 'none', marginBottom: 12 }} />

      {/* Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {tags.map(t => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-fixed)', borderRadius: 8, padding: '4px 8px' }}>
            #{t}<button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', padding: 0 }}><Icon name="close" size={14} /></button>
          </span>
        ))}
        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="+ tag"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: 'none', border: 'none', outline: 'none', color: 'var(--on-surface)', width: 80 }} />
      </div>

      {/* Editor / preview */}
      {isMobile ? (
        <>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'var(--surface-container)', borderRadius: 9999, padding: 4, width: 'fit-content' }}>
            {(['edit', 'preview'] as const).map(v => (
              <button key={v} onClick={() => setMobileView(v)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '6px 16px', border: 'none', background: mobileView === v ? 'var(--surface-container-lowest)' : 'transparent', color: mobileView === v ? 'var(--primary)' : 'var(--on-surface-variant)', boxShadow: mobileView === v ? 'var(--shadow-sm)' : 'none' }}>{v === 'edit' ? 'Úprava' : 'Náhľad'}</button>
            ))}
          </div>
          {mobileView === 'edit' ? editor : preview}
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Úprava</div>{editor}</div>
          <div><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Náhľad</div>{preview}</div>
        </div>
      )}
    </div>
  );
}
