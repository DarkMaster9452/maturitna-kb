'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, StatCard, Chip, Avatar, Progress, EmptyState, Skeleton } from '@/components/ui';
import { Counter, Reveal } from '@/components/motion';
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
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin').then(r => { if (r.status === 403) { router.push('/dashboard'); return null; } return r.json(); }).then(d => d && setData(d));
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
    fetch('/api/admin/logs').then(r => r.json()).then(d => setLogs(d.logs || [])).catch(() => {});
  }, []);

  const changeRole = async (id: string, role: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    if (!res.ok) { const d = await res.json(); flash(d.error || 'Chyba'); fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])); }
    else flash('Rola zmenená');
  };
  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Naozaj zmazať používateľa ${name}? Táto akcia je nevratná.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) { setUsers(us => us.filter(u => u.id !== id)); flash(`${name} zmazaný`); }
    else { const d = await res.json(); flash(d.error || 'Chyba'); }
  };

  if (!data) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
      {[0, 1, 2, 3].map(i => <Skeleton key={i} height={110} radius={14} />)}
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

  const tabs = [['overview', 'Prehľad'], ['users', 'Používatelia'], ['teaching', 'Učenie'], ['logs', 'Logy'], ['system', 'Systém']];
  const logIcon: Record<string, string> = { test: 'fact_check', user: 'person_add', note: 'edit_note', session: 'timer' };

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
            {stat.map(x => <StatCard key={x.label} icon={x.icon} label={x.label} value={<Counter value={Number(x.value)} />} tone={x.tone} />)}
          </div>
          <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card>
                <span className="mkb-eyebrow">Rozdelenie rolí</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {data.roles.map((r: any) => (
                    <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <IconChip name={ROLE_META[r.role]?.icon || 'person'} size={30} radius={8} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{ROLE_META[r.role]?.label || r.role}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{r.c}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <span className="mkb-eyebrow">Aktivita (7 dní)</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, margin: '10px 0 2px' }}><Counter value={Number(s.resultsWeek)} /></div>
                <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)' }}>dokončených testov tento týždeň</div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── Používatelia ─────────────────────────────────── */}
      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
              <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hľadať používateľa…"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '10px 14px 10px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'student', 'teacher', 'admin', 'owner'].map(rf => (
                <button key={rf} onClick={() => setRoleFilter(rf)} style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', border: `1px solid ${roleFilter === rf ? 'var(--primary)' : 'var(--outline-variant)'}`, background: roleFilter === rf ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: roleFilter === rf ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)' }}>
                  {rf === 'all' ? 'Všetci' : ROLE_META[rf]?.label}
                </button>
              ))}
            </div>
          </div>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
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
                        <button onClick={() => deleteUser(u.id, u.name)} disabled={u.id === user?.id} title="Zmazať"
                          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface-variant)', cursor: u.id === user?.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: u.id === user?.id ? .4 : 1 }}>
                          <Icon name="delete" size={17} />
                        </button>
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
                  {data.subjectStats.map((s: any, i: number) => (
                    <tr key={s.slug} style={{ borderBottom: i < data.subjectStats.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                      <td style={{ padding: '11px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <IconChip name={s.icon} size={34} radius={9} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name_sk}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{s.student_count}</td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{s.material_count}</td>
                      <td style={{ padding: '11px 22px', fontSize: 14 }}>{s.test_count}</td>
                      <td style={{ padding: '11px 22px' }}><button onClick={() => flash('Spravovať…')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Spravovať</button></td>
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
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)' }}><Serif size={20} weight={600}>Denník aktivity</Serif></div>
          {logs.length === 0 ? <EmptyState icon="history" title="Žiadna aktivita" /> : logs.map((l, i) => (
            <Reveal key={i} delay={Math.min(i * 30, 300)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <IconChip name={logIcon[l.kind] || 'bolt'} size={38} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {l.actor}{' '}
                    <span style={{ fontWeight: 500, color: 'var(--on-surface-variant)' }}>
                      {l.kind === 'test' && 'dokončil test'}{l.kind === 'user' && 'sa zaregistroval'}{l.kind === 'note' && 'upravil poznámku'}{l.kind === 'session' && 'mal študijnú session'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.kind === 'test' && `${l.detail} · ${l.meta}%`}
                    {l.kind === 'user' && `${l.detail} · ${ROLE_META[l.meta]?.label || l.meta}`}
                    {l.kind === 'note' && l.detail}
                    {l.kind === 'session' && `${l.meta} minút`}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{relTime(l.at)}</span>
              </div>
            </Reveal>
          ))}
        </Card>
      )}

      {/* ── Systém ───────────────────────────────────────── */}
      {tab === 'system' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[['Používatelia', s.users, 'group'], ['Predmety', s.subjects, 'school'], ['Okruhy', s.okruhy, 'category'], ['Materiály', s.materials, 'upload_file'], ['Testy', s.tests, 'quiz'], ['Výsledky', s.testResults, 'fact_check'], ['Poznámky', s.notes, 'edit_note']].map(([label, val, icon]) => (
              <div key={label as string} style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconChip name={icon as string} size={38} radius={10} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}><Counter value={Number(val)} /></div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 3 }}>{label} <span className="mkb-mono" style={{ fontSize: 10 }}>riadkov</span></div>
                </div>
              </div>
            ))}
          </div>
          <Card>
            <span className="mkb-eyebrow">Systémové informácie</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
              {[['Framework', 'Next.js 14 · App Router'], ['Databáza', 'Neon PostgreSQL 17'], ['Autentifikácia', 'JWT · httpOnly cookie'], ['Stav', 'Prevádzka v poriadku']].map(([k, v]) => (
                <div key={k} style={{ padding: '12px 0', borderTop: '1px solid var(--outline-variant)' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>{k}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {k === 'Stav' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} className="mkb-pulse" />}
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
