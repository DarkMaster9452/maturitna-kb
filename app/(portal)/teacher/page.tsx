'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Chip, Progress, Avatar, Input, StatCard, EmptyState } from '@/components/ui';
import { Reveal, Counter, fireConfetti } from '@/components/motion';
import { useUser, useToastCtx } from '../layout';

type Student = { id: string; name: string; email: string; avg_progress: number; tests_count: number; subjects_count: number; last_active: string | null };

export default function TeacherPage() {
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const allowed = user && ['teacher', 'admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (user && !allowed) { router.push('/dashboard'); return; }
    if (!allowed) return;
    loadStudents();
    fetch('/api/teacher/invite').then(r => r.json()).then(d => d.code && setCode(d.code)).catch(() => {});
    fetch('/api/materials').then(r => r.json()).then(d => setMaterials(d.materials || [])).catch(() => {});
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, [user]);

  const loadStudents = () => {
    setLoadingStudents(true);
    fetch('/api/teacher/students').then(r => r.json())
      .then(d => setStudents(Array.isArray(d.students) ? d.students : []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  };

  const addStudent = async () => {
    if (!email.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/teacher/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (!res.ok) { flash(d.error || 'Nepodarilo sa pridať študenta.'); setAdding(false); return; }
      setEmail('');
      fireConfetti();
      flash(`Študent ${d.student?.name || ''} pridaný!`);
      loadStudents();
    } catch { flash('Sieťová chyba.'); }
    setAdding(false);
  };

  const removeStudent = async (id: string, name: string) => {
    setStudents(s => s.filter(x => x.id !== id));
    await fetch(`/api/teacher/students/${id}`, { method: 'DELETE' });
    flash(`${name} odobratý z triedy`);
  };

  const copyCode = (e: React.MouseEvent) => {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
    fireConfetti({ x: (e as any).clientX, y: (e as any).clientY, count: 50 });
    flash('Kód skopírovaný!');
  };

  const regen = async () => {
    const res = await fetch('/api/teacher/invite', { method: 'POST' });
    const d = await res.json();
    if (d.code) { setCode(d.code); flash('Nový kód vygenerovaný'); }
  };

  const avgClass = students.length ? Math.round(students.reduce((a, s) => a + Number(s.avg_progress || 0), 0) / students.length) : 0;
  const totalTests = students.reduce((a, s) => a + Number(s.tests_count || 0), 0);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow icon="co_present">Učiteľský panel</Eyebrow>
          <Serif size={44} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(28px, 6vw, 44px)' }}>Moja trieda</Serif>
          <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Pozývaj študentov, sleduj ich pokrok a spravuj obsah.</div>
        </div>
      </header>

      {/* Stats */}
      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="group" label="Študenti" value={<Counter value={students.length} />} sub="v tvojej triede" tone="primary" />
        <StatCard icon="trending_up" label="Priemer triedy" value={<Counter value={avgClass} suffix="%" />} sub="priemerný pokrok" tone="success" />
        <StatCard icon="quiz" label="Testy spolu" value={<Counter value={totalTests} />} sub="absolvované študentmi" tone="tertiary" />
      </div>

      {/* Tabs */}
      <div className="mkb-rail" style={{ gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28 }}>
        {[['students', 'Študenti'], ['materials', 'Materiály'], ['tests', 'Testy'], ['subjects', 'Predmety']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {tab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Invite + add */}
          <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Invite code — ink panel */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, padding: 24, background: 'var(--panel-ink)', color: '#fff' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--panel-ink-line) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .5 }} />
              <div style={{ position: 'relative' }}>
                <span className="mkb-eyebrow" style={{ color: 'var(--panel-ink-variant)' }}>Pozývací kód</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 8px', flexWrap: 'wrap' }}>
                  <button onClick={copyCode} title="Kliknutím skopíruješ"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 700, letterSpacing: '.14em', color: '#fff', background: 'rgba(255,255,255,.08)', border: '1px solid var(--panel-ink-line)', borderRadius: 12, padding: '10px 18px', cursor: 'pointer' }}>
                    {code || '••••••'}
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={copyCode} title="Skopírovať" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid var(--panel-ink-line)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="content_copy" size={20} /></button>
                    <button onClick={regen} title="Vygenerovať nový" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.1)', border: '1px solid var(--panel-ink-line)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="refresh" size={20} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--panel-ink-variant)', lineHeight: 1.5 }}>Zdieľaj tento kód so študentmi. Zadajú ho v <strong style={{ color: '#fff' }}>Nastavenia → Trieda</strong> a pripoja sa k tebe.</div>
              </div>
            </div>

            {/* Add by email */}
            <Card pad={24} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 4 }}>Pridať študenta</Serif>
              <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginBottom: 16 }}>Ak už má účet, pridaj ho priamo e-mailom.</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <Input label="E-mail študenta" type="email" placeholder="student@skola.sk" value={email} onChange={e => setEmail(e.target.value)} icon="mail" onKeyDown={e => e.key === 'Enter' && addStudent()} />
                </div>
                <Button icon="person_add" onClick={addStudent} disabled={adding}>{adding ? 'Pridávam…' : 'Pridať'}</Button>
              </div>
            </Card>
          </div>

          {/* Roster */}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)' }}>
              <Serif size={20} weight={600}>Zoznam študentov</Serif>
              <Chip tone="soft">{students.length}</Chip>
            </div>
            {loadingStudents ? (
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0, 1, 2].map(i => <div key={i} className="mkb-skeleton" style={{ height: 56, borderRadius: 10 }} />)}
              </div>
            ) : students.length === 0 ? (
              <EmptyState icon="group_add" title="Zatiaľ žiadni študenti" desc="Zdieľaj pozývací kód alebo pridaj študenta e-mailom a začni sledovať ich pokrok." />
            ) : (
              <div>
                {students.map((s, i) => (
                  <Reveal key={s.id} delay={i * 45}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr auto auto', gap: 16, alignItems: 'center', padding: '14px 22px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }} className="mkb-studentrow">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <Avatar name={s.name} size={40} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Progress value={Number(s.avg_progress)} right={Number(s.avg_progress) + '%'} height={6} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }} className="mkb-hide-mobile">
                        <Chip tone="soft" icon="book">{s.subjects_count}</Chip>
                        <Chip tone="soft" icon="quiz">{s.tests_count}</Chip>
                      </div>
                      <button onClick={() => removeStudent(s.id, s.name)} title="Odobrať z triedy"
                        style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'var(--error)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}>
                        <Icon name="person_remove" size={18} />
                      </button>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'materials' && (
        <Card pad={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Serif size={20} weight={600}>Všetky materiály</Serif>
            <Button icon="add" onClick={() => flash('Otvára sa editor materiálu…')}>Pridať</Button>
          </div>
          {materials.length === 0 ? (
            <EmptyState icon="upload_file" title="Žiadne materiály" desc="Nahraj prvý materiál pre svojich študentov." />
          ) : (
            <div className="mkb-tablewrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Názov', 'Predmet', 'Typ', 'Dátum', ''].map(h => <th key={h} style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '0 0 10px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {materials.slice(0, 15).map((m: any, i: number) => (
                    <tr key={m.id} style={{ borderBottom: i < Math.min(materials.length, 15) - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                      <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600 }}>{m.title}</td>
                      <td style={{ padding: '12px 0' }}><Chip tone="subject">{m.subject_name || '—'}</Chip></td>
                      <td style={{ padding: '12px 0' }}><Chip tone="neutral">{m.type || 'PDF'}</Chip></td>
                      <td style={{ padding: '12px 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(m.created_at).toLocaleDateString('sk-SK')}</td>
                      <td style={{ padding: '12px 0' }}><button onClick={() => flash('Upravujem…')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 4 }}><Icon name="edit" size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'tests' && (
        <Card pad={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Serif size={20} weight={600}>Moje testy</Serif>
            <Button icon="add" onClick={() => flash('Otvára sa tvorba testu…')}>Vytvoriť test</Button>
          </div>
          <EmptyState icon="quiz" title="Vytvor prvý test" desc="Testy si môžu robiť všetci tví študenti a výsledky uvidíš v prehľade triedy." />
        </Card>
      )}

      {tab === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {subjects.map((s: any) => (
            <Card key={s.id} hover pad={20}>
              <IconChip name={s.icon} size={40} radius={10} />
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 14 }}>{s.name_sk}</div>
            </Card>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 720px){ .mkb-studentrow{ grid-template-columns: 1fr auto !important; } }`}</style>
    </div>
  );
}
