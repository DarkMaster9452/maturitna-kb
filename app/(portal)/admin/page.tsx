'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, StatCard, Chip, Avatar, Progress, EmptyState, Input } from '@/components/ui';
import { Counter, Reveal } from '@/components/motion';
import { LineArea, Bars, HBars } from '@/components/charts';
import { useUser, useToastCtx } from '../layout';

const ROLE_META: Record<string, { label: string; tone: string; icon: string }> = {
  student: { label: 'Študent', tone: 'soft', icon: 'person' },
  teacher: { label: 'Učiteľ', tone: 'success', icon: 'co_present' },
  admin: { label: 'Administrátor', tone: 'trend', icon: 'shield_person' },
  owner: { label: 'Vlastník', tone: 'warning', icon: 'workspace_premium' },
};

const relTime = (d: string) => {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'práve teraz';
  if (diff < 3600) return `pred ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `pred ${Math.floor(diff / 3600)} h`;
  return `pred ${Math.floor(diff / 86400)} dňami`;
};

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [logKind, setLogKind] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin').then(r => { if (r.status === 403) { router.push('/dashboard'); return null; } return r.json(); }).then(d => d && setData(d));
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
    fetch('/api/admin/logs').then(r => r.json()).then(d => setLogs(d.logs || [])).catch(() => {});
    fetch('/api/admin/charts').then(r => r.json()).then(setCharts).catch(() => {});
  }, []);

  const saveEdit = async () => {
    const res = await fetch(`/api/admin/users/${edit.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: edit.name, email: edit.email, role: edit.role }) });
    const d = await res.json();
    if (!res.ok) { flash(d.error || 'Chyba'); return; }
    setUsers(us => us.map(u => u.id === edit.id ? { ...u, name: edit.name, email: edit.email, role: edit.role } : u));
    setEdit(null); flash('Používateľ upravený');
  };
  const changeRole = async (id: string, role: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    if (!res.ok) { const d = await res.json(); flash(d.error || 'Chyba'); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])); } else flash('Rola zmenená');
  };
  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Naozaj zmazať používateľa ${name}? Táto akcia je nevratná.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) { setUsers(us => us.filter(u => u.id !== id)); setEdit(null); flash(`${name} zmazaný`); }
    else { const d = await res.json(); flash(d.error || 'Chyba'); }
  };

  if (!data) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
      {[0, 1, 2, 3].map(i => <div key={i} className="mkb-skeleton" style={{ height: 110, borderRadius: 14 }} />)}
    </div>
  );

  const s = data.stats;
  const stat = [
    { icon: 'group', label: 'Používatelia', value: s.users, tone: 'primary' as const },
    { icon: 'person', label: 'Študenti', value: s.students, tone: 'tertiary' as const },
    { icon: 'co_present', label: 'Učitelia', value: s.teachers, tone: 'success' as const },
    { icon: 'school', label: 'Predmety', value: s.subjects, tone: 'primary' as const },
    { icon: 'upload_file', label: 'Materiály', value: s.materials, tone: 'tertiary' as const },
    { icon: 'quiz', label: 'Testy', value: s.tests, tone: 'primary' as const },
    { icon: 'fact_check', label: 'Výsledky testov', value: s.testResults, tone: 'success' as const },
    { icon: 'edit_note', label: 'Poznámky', value: s.notes, tone: 'tertiary' as const },
  ];
  const filteredUsers = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())));
  const filteredLogs = logs.filter(l => (logKind === 'all' || l.kind === logKind) && (!logSearch || l.actor?.toLowerCase().includes(logSearch.toLowerCase()) || (l.detail || '').toLowerCase().includes(logSearch.toLowerCase())));

  const tabs = [['overview', 'Prehľad'], ['users', 'Používatelia'], ['teaching', 'Učenie'], ['logs', 'Logy'], ['system', 'Systém']];
  const logIcon: Record<string, string> = { test: 'fact_check', user: 'person_add', note: 'edit_note', session: 'timer' };
  const services = [['Aplikácia (Next.js)', 'operational'], ['Databáza (Neon)', 'operational'], ['Autentifikácia (JWT)', 'operational'], ['Úložisko súborov', 'operational'], ['API', 'operational']];

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow icon="shield_person">Administrácia</Eyebrow>
        <Serif size={44} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(28px, 6vw, 44px)' }}>Admin panel</Serif>
        <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Úplný prehľad a kontrola nad platformou MaturitaKB.</div>
      </header>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {/* ── Prehľad ──────────────────────────────────────── */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {stat.map(x => <StatCard key={x.label} icon={x.icon} label={x.label} value={<Counter value={Number(x.value)} />} tone={x.tone} />)}
          </div>
          {charts && (
            <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Serif size={19} weight={600}>Testy za 14 dní</Serif>
                  <Chip tone="trend">{s.resultsWeek} za týždeň</Chip>
                </div>
                <LineArea data={charts.resultsByDay || []} height={160} />
              </Card>
              <Card>
                <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Rozdelenie rolí</Serif>
                <HBars data={(data.roles || []).map((r: any) => ({ label: ROLE_META[r.role]?.label || r.role, value: Number(r.c) }))} />
              </Card>
            </div>
          )}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)' }}><Serif size={20} weight={600}>Posledné výsledky testov</Serif></div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Používateľ', 'Test', 'Predmet', 'Skóre', 'Čas'].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 22px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.recentResults.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: i < data.recentResults.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                      <td style={{ padding: '11px 22px', fontSize: 14, fontWeight: 600 }}>{r.user_name}</td>
                      <td style={{ padding: '11px 22px', color: 'var(--on-surface-variant)', fontSize: 13.5 }}>{r.test_title}</td>
                      <td style={{ padding: '11px 22px' }}><Chip tone="soft">{r.subject_name}</Chip></td>
                      <td style={{ padding: '11px 22px' }}><Chip tone={r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'}>{r.score}%</Chip></td>
                      <td style={{ padding: '11px 22px', color: 'var(--on-surface-variant)', fontSize: 12 }}>{relTime(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Používatelia ─────────────────────────────────── */}
      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
              <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hľadať meno alebo e-mail…"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'student', 'teacher', 'admin', 'owner'].map(rf => (
                <button key={rf} onClick={() => setRoleFilter(rf)} style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', border: `1px solid ${roleFilter === rf ? 'var(--primary)' : 'var(--outline-variant)'}`, background: roleFilter === rf ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: roleFilter === rf ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)' }}>
                  {rf === 'all' ? `Všetci (${users.length})` : ROLE_META[rf]?.label}
                </button>
              ))}
            </div>
          </div>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Používateľ', 'Rola', 'Predmety', 'Testy', 'Pokrok', 'Registrácia', ''].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 20px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <Avatar name={u.name} size={36} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={u.id === user?.id}
                          style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', cursor: u.id === user?.id ? 'not-allowed' : 'pointer' }}>
                          {['student', 'teacher', 'admin', 'owner'].map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 14 }}>{u.subjects_count}</td>
                      <td style={{ padding: '12px 20px', fontSize: 14 }}>{u.tests_count}</td>
                      <td style={{ padding: '12px 20px', width: 130 }}><Progress value={Number(u.avg_progress)} right={Number(u.avg_progress) + '%'} height={6} /></td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(u.created_at).toLocaleDateString('sk-SK')}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setEdit({ ...u })} title="Upraviť" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="edit" size={16} /></button>
                          <button onClick={() => deleteUser(u.id, u.name)} disabled={u.id === user?.id} title="Zmazať"
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', cursor: u.id === user?.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: u.id === user?.id ? .4 : 1 }}><Icon name="delete" size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && <EmptyState icon="person_search" title="Nič sa nenašlo" desc="Skús iný filter alebo výraz." />}
          </Card>
        </div>
      )}

      {/* ── Učenie ───────────────────────────────────────── */}
      {tab === 'teaching' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[['Pridať predmet', 'add_circle'], ['Nahrať materiál', 'upload_file'], ['Vytvoriť test', 'quiz'], ['Nový okruh', 'category']].map(([label, icon]) => (
              <Card key={label} hover onClick={() => flash(`${label}…`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconChip name={icon} size={42} radius={11} grad />
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                </div>
              </Card>
            ))}
          </div>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Serif size={20} weight={600}>Predmety a obsah</Serif>
              <Chip tone="soft">{data.subjectStats.length} predmetov</Chip>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Predmet', 'Študenti', 'Materiály', 'Testy', ''].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 22px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.subjectStats.map((sj: any, i: number) => (
                    <tr key={sj.slug} style={{ borderBottom: i < data.subjectStats.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                      <td style={{ padding: '11px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <IconChip name={sj.icon} size={34} radius={9} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{sj.name_sk}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.student_count}</td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.material_count}</td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{sj.test_count}</td>
                      <td style={{ padding: '11px 22px' }}><a href={`/subjects/${sj.slug}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Spravovať</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Logy ─────────────────────────────────────────── */}
      {tab === 'logs' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
              <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
              <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Hľadať v logoch…"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['all', 'Všetko'], ['test', 'Testy'], ['user', 'Registrácie'], ['note', 'Poznámky'], ['session', 'Sessions']].map(([id, label]) => (
                <button key={id} onClick={() => setLogKind(id)} style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', border: `1px solid ${logKind === id ? 'var(--primary)' : 'var(--outline-variant)'}`, background: logKind === id ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: logKind === id ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)' }}>{label}</button>
              ))}
            </div>
          </div>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            {filteredLogs.length === 0 ? <EmptyState icon="history" title="Žiadne záznamy" /> : filteredLogs.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <IconChip name={logIcon[l.kind] || 'bolt'} size={38} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{l.actor}{' '}<span style={{ fontWeight: 500, color: 'var(--on-surface-variant)' }}>{l.kind === 'test' && 'dokončil test'}{l.kind === 'user' && 'sa zaregistroval'}{l.kind === 'note' && 'upravil poznámku'}{l.kind === 'session' && 'mal študijnú session'}</span></div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.kind === 'test' && `${l.detail} · ${l.meta}%`}{l.kind === 'user' && `${l.detail} · ${ROLE_META[l.meta]?.label || l.meta}`}{l.kind === 'note' && l.detail}{l.kind === 'session' && `${l.meta} minút`}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{relTime(l.at)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Systém ───────────────────────────────────────── */}
      {tab === 'system' && (
        <div>
          {/* Services */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="mkb-eyebrow">Stav služieb</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--success)' }}><span className="mkb-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> Všetko beží</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {services.map(([name]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--success)', flex: 'none' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{name}</span>
                  <span className="mkb-mono" style={{ fontSize: 11, color: 'var(--success)' }}>OK</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Charts */}
          {charts && (
            <>
              <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <Card>
                  <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Testy za 14 dní</Serif>
                  <LineArea data={charts.resultsByDay || []} height={150} />
                </Card>
                <Card>
                  <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Hodiny sessions za 14 dní</Serif>
                  <Bars data={(charts.sessionsByDay || []).map((d: any) => ({ label: d.label, value: Number(d.value) }))} height={150} unit="h" />
                </Card>
              </div>
              <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <Card>
                  <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Rozdelenie skóre</Serif>
                  <HBars data={(charts.scoreBuckets || []).map((b: any) => ({ label: b.label, value: Number(b.value) }))} />
                </Card>
                <Card>
                  <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Najobľúbenejšie predmety</Serif>
                  <HBars data={(charts.topSubjects || []).map((b: any) => ({ label: b.label, value: Number(b.value) }))} />
                </Card>
              </div>
            </>
          )}

          {/* Row counts */}
          <Card>
            <span className="mkb-eyebrow">Databáza — počet záznamov</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
              {[['Používatelia', s.users, 'group'], ['Predmety', s.subjects, 'school'], ['Okruhy', s.okruhy, 'category'], ['Materiály', s.materials, 'upload_file'], ['Testy', s.tests, 'quiz'], ['Výsledky', s.testResults, 'fact_check'], ['Poznámky', s.notes, 'edit_note']].map(([label, val, icon]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 12, border: '1px solid var(--outline-variant)' }}>
                  <IconChip name={icon as string} size={34} radius={9} />
                  <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}><Counter value={Number(val)} /></div><div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 2 }}>{label}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Edit user modal ──────────────────────────────── */}
      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(6,6,8,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'mkb-fade-in .2s ease' }}>
          <div onClick={e => e.stopPropagation()} className="mkb-fade-up" style={{ width: '100%', maxWidth: 440, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 18, padding: 26, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name={edit.name} size={44} />
              <div><Serif size={20} weight={600} style={{ display: 'block' }}>Upraviť používateľa</Serif></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Meno" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} icon="person" />
              <Input label="E-mail" type="email" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} icon="mail" />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Rola</span>
                <select value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value })} disabled={edit.id === user?.id}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 14, padding: '11px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)' }}>
                  {['student', 'teacher', 'admin', 'owner'].map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'space-between' }}>
              <Button variant="danger" icon="delete" onClick={() => deleteUser(edit.id, edit.name)} disabled={edit.id === user?.id}>Zmazať</Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={() => setEdit(null)}>Zrušiť</Button>
                <Button icon="save" onClick={saveEdit}>Uložiť</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
