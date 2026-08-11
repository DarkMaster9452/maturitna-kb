'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow } from '@/components/ui';
import { useUser, useToastCtx } from '../../layout';
import { OKRUH_CATEGORIES, DEFAULT_OKRUH, categoryById } from '@/lib/categories';

export default function SubjectDetailPage() {
  const params = useParams();
  const [subject, setSubject] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const { refetchPinned } = useUser();
  const { flash } = useToastCtx();
  const [activeTab, setActiveTab] = useState<'materials' | 'tests' | 'resources' | 'okruhy'>('materials');
  const [okruhy, setOkruhy] = useState<any[]>([]);
  const [newOkruhTitle, setNewOkruhTitle] = useState('');
  const [newOkruhCat, setNewOkruhCat] = useState('');
  const [addingOkruh, setAddingOkruh] = useState(false);
  const [expandedOkruh, setExpandedOkruh] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/subjects/${params.id}`).then(r => r.json()).then(setSubject);
    fetch('/api/user/subjects').then(r => r.json()).then(setUserData);
    fetch(`/api/subjects/${params.id}/okruhy`).then(r => r.json()).then(d => Array.isArray(d) ? setOkruhy(d) : null);
  }, [params.id]);

  const refetchOkruhy = () =>
    fetch(`/api/subjects/${params.id}/okruhy`).then(r => r.json()).then(d => Array.isArray(d) ? setOkruhy(d) : null);

  const createOkruh = async () => {
    if (!newOkruhTitle.trim()) return;
    setAddingOkruh(true);
    const cat = OKRUH_CATEGORIES.find(c => c.id === newOkruhCat);
    await fetch(`/api/subjects/${params.id}/okruhy`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newOkruhTitle, category: cat?.id || null, icon: cat?.icon || null, color: cat?.color || null }),
    });
    setNewOkruhTitle('');
    setNewOkruhCat('');
    setAddingOkruh(false);
    await refetchOkruhy();
    flash('Okruh vytvorený');
  };

  const uploadFile = async (okruhId: number, file: File) => {
    setUploading(okruhId);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/okruhy/${okruhId}/files`, { method: 'POST', body: fd });
    setUploading(null);
    if (!res.ok) {
      const e = await res.json();
      flash(e.error || 'Chyba pri nahrávaní');
    } else {
      await refetchOkruhy();
      flash('Súbor nahraný');
    }
  };

  const deleteFile = async (fileId: number) => {
    await fetch(`/api/okruh-files/${fileId}`, { method: 'DELETE' });
    await refetchOkruhy();
    flash('Súbor odstránený');
  };

  const isPinned = (userData?.pinned || []).some((s: any) => s.id === subject?.id);

  const togglePin = async () => {
    await fetch(`/api/subjects/${subject.id}/pin`, { method: isPinned ? 'DELETE' : 'POST' });
    const d = await fetch('/api/user/subjects').then(r => r.json());
    setUserData(d);
    refetchPinned();
    flash(isPinned ? 'Predmet odopnutý' : 'Predmet pripnutý do sidebaru');
  };

  const prog = (userData?.progress || []).find((p: any) => p.subject_id === subject?.id);

  if (!subject) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Video: { bg: 'var(--secondary-fixed)', c: 'var(--secondary)' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Audio: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
    Notes: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Test: { bg: 'var(--error-container)', c: 'var(--error)' },
    Reading: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Guide: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
  };
  const diffColor: Record<string, any> = {
    Easy: { bg: 'var(--success-container)', c: 'var(--success)' },
    Medium: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Hard: { bg: 'var(--error-container)', c: 'var(--error)' },
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--on-surface-variant)' }}>
        <Link href="/subjects" style={{ color: 'var(--primary)', fontWeight: 600 }}>Predmety</Link>
        <Icon name="chevron_right" size={16} />
        <span>{subject.name_sk}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', minWidth: 0, flex: '1 1 260px' }}>
          <IconChip name={subject.icon} size={64} radius={16} />
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Maturitný predmet</Eyebrow>
            <Serif size={44} weight={700} style={{ display: 'block', margin: '8px 0 4px' }}>{subject.name_sk}</Serif>
            <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>{subject.description_sk}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={isPinned ? 'push_pin' : 'push_pin'} onClick={togglePin}
            style={{ background: isPinned ? 'var(--primary-fixed)' : undefined, color: isPinned ? 'var(--primary)' : undefined, borderColor: isPinned ? 'var(--primary)' : undefined }}>
            {isPinned ? 'Odopnúť' : 'Pripnúť'}
          </Button>
          <Button icon="play_arrow" onClick={() => flash('Spúšťam session…')}>Štartovať</Button>
        </div>
      </div>

      {/* Progress card */}
      {prog && (
        <Card pad={24} radius={12} style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Pokrok kurzu</div>
            <Progress value={prog.progress_pct} right={prog.progress_pct + '%'} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Hodiny štúdia</div>
            <Serif size={28} weight={700}>{prog.study_hours}h</Serif>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Materiály</div>
            <Serif size={28} weight={700}>{subject.materials?.length || 0}</Serif>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="mkb-rail" style={{ gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28 }}>
        {(['materials', 'tests', 'resources', 'okruhy'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', color: activeTab === t ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {t === 'materials' ? `Materiály (${subject.materials?.length || 0})` : t === 'tests' ? `Testy (${subject.tests?.length || 0})` : t === 'resources' ? `Zdroje (${subject.resources?.length || 0})` : `Okruhy (${okruhy.length})`}
          </button>
        ))}
      </div>

      {/* Materials */}
      {activeTab === 'materials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {(subject.materials || []).map((m: any) => (
            <Link key={m.id} href={`/materials/${m.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: typeColor[m.type]?.bg || 'var(--primary-fixed)', color: typeColor[m.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={m.icon} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                    <Chip tone="subject">{m.type}</Chip>
                    {m.is_new && <Chip tone="trend">Nové</Chip>}
                  </div>
                  <Serif size={17} weight={600} style={{ display: 'block', marginBottom: 6 }}>{m.title}</Serif>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{m.meta}</div>
                </div>
              </Card>
            </Link>
          ))}
          {(!subject.materials || subject.materials.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--on-surface-variant)', fontSize: 16 }}>
              <IconChip name="description" size={56} radius={14} style={{ margin: '0 auto 16px' }} />
              Pre tento predmet zatiaľ nie sú žiadne materiály.
            </div>
          )}
        </div>
      )}

      {/* Tests */}
      {activeTab === 'tests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {(subject.tests || []).map((t: any) => (
            <Link key={t.id} href={`/tests/${t.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={24} radius={12} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <IconChip name={t.icon} size={44} radius={10} />
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: diffColor[t.difficulty]?.bg, color: diffColor[t.difficulty]?.c }}>{t.difficulty}</span>
                </div>
                <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 8 }}>{t.title}</Serif>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16, display: 'flex', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="schedule" size={14} />{t.duration_minutes} min</span>
                </div>
                <Button variant="primary" full icon="play_arrow">Spustiť test</Button>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Okruhy */}
      {activeTab === 'okruhy' && (
        <div>
          {/* Add okruh — with category templates */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>Typ okruhu</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {[{ id: '', label: DEFAULT_OKRUH.label, icon: DEFAULT_OKRUH.icon, color: DEFAULT_OKRUH.color }, ...OKRUH_CATEGORIES].map(c => {
                const active = newOkruhCat === c.id;
                return (
                  <button key={c.id || 'custom'} onClick={() => setNewOkruhCat(c.id)} title={c.label}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', background: active ? (c.color + '1f') : 'var(--surface-container-lowest)', color: active ? c.color : 'var(--on-surface-variant)', border: `1px solid ${active ? c.color : 'var(--outline-variant)'}`, transition: 'all .15s' }}>
                    <Icon name={c.icon} size={16} fill={active ? 1 : 0} style={{ color: active ? c.color : 'var(--on-surface-variant)' }} />{c.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                value={newOkruhTitle}
                onChange={e => setNewOkruhTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createOkruh()}
                placeholder="Názov nového okruhu…"
                style={{ flex: '1 1 220px', padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--outline)', fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', outline: 'none' }}
              />
              <Button icon="add" onClick={createOkruh} disabled={addingOkruh || !newOkruhTitle.trim()}>
                Pridať okruh
              </Button>
            </div>
          </div>

          {okruhy.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--on-surface-variant)', fontSize: 16 }}>
              <IconChip name="list_alt" size={56} radius={14} style={{ margin: '0 auto 16px' }} />
              Pre tento predmet zatiaľ nie sú žiadne okruhy.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {okruhy.map((okruh: any) => (
              <Card key={okruh.id} pad={0} radius={12}>
                {/* Okruh header */}
                <div
                  onClick={() => setExpandedOkruh(expandedOkruh === okruh.id ? null : okruh.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}
                >
                  {(() => { const c = categoryById(okruh.category); return <IconChip name={okruh.icon || c.icon} size={40} radius={10} bg={(okruh.color || c.color) + '22'} color={okruh.color || c.color} />; })()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{okruh.title}</div>
                    {okruh.description && <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{okruh.description}</div>}
                  </div>
                  <Chip tone="soft" icon="attach_file">{okruh.files?.length || 0}</Chip>
                  <Icon name={expandedOkruh === okruh.id ? 'expand_less' : 'expand_more'} style={{ flex: 'none' }} />
                </div>

                {/* Expanded: files + upload */}
                {expandedOkruh === okruh.id && (
                  <div style={{ borderTop: '1px solid var(--outline-variant)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* File list */}
                    {(okruh.files || []).map((f: any) => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-container-high)' }}>
                        <Icon name={f.mimetype?.startsWith('image/') ? 'image' : f.mimetype?.includes('pdf') ? 'picture_as_pdf' : f.mimetype?.includes('sheet') || f.mimetype?.includes('excel') ? 'table_chart' : f.mimetype?.includes('presentation') ? 'slideshow' : 'description'} size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{(f.size_bytes / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <a href={`/api/okruh-files/${f.id}`} download={f.filename} title="Stiahnuť" className="mkb-tap"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, color: 'var(--primary)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'var(--primary-fixed)', fontWeight: 600, flex: 'none' }}>
                          <Icon name="download" size={16} /> <span className="mkb-hide-mobile">Stiahnuť</span>
                        </a>
                        <button onClick={() => deleteFile(f.id)} aria-label="Zmazať súbor" className="mkb-tap"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    ))}

                    {/* Upload area */}
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 24px', border: '2px dashed var(--outline-variant)', borderRadius: 10, cursor: uploading === okruh.id ? 'not-allowed' : 'pointer', opacity: uploading === okruh.id ? 0.6 : 1, background: 'var(--surface-container-lowest)', transition: 'border-color .2s' }}
                      onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
                      onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--outline-variant)'; }}
                      onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--outline-variant)'; const f = e.dataTransfer.files[0]; if (f) uploadFile(okruh.id, f); }}
                    >
                      <input type="file" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp,.txt" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(okruh.id, f); e.target.value = ''; }}
                        disabled={uploading === okruh.id} />
                      <Icon name={uploading === okruh.id ? 'hourglass_empty' : 'upload_file'} size={32} style={{ color: 'var(--primary)' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>
                        {uploading === okruh.id ? 'Nahrávam…' : 'Kliknite alebo pretiahnite súbor'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                        PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, WEBP, TXT · max 30 MB
                      </div>
                    </label>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {(subject.resources || []).map((r: any) => (
            <Link key={r.id} href={`/resources/${r.id}`} style={{ textDecoration: 'none' }}>
              <Card hover pad={20} radius={12} style={{ display: 'flex', gap: 16, cursor: 'pointer' }}>
                <IconChip name={r.icon} size={44} radius={10} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Chip tone="subject">{r.type}</Chip>
                    {r.badge && <Chip tone="trend">{r.badge}</Chip>}
                  </div>
                  <Serif size={16} weight={600} style={{ display: 'block', marginBottom: 4 }}>{r.title}</Serif>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{r.description}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
