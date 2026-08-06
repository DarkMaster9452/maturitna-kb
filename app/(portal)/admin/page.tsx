'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Progress, Serif, Eyebrow, StatCard } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const { user } = useUser();
  const { flash } = useToastCtx();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin').then(r => {
      if (r.status === 403) { router.push('/dashboard'); return null; }
      return r.json();
    }).then(d => d && setData(d));
  }, []);

  if (!data) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const { stats, recentResults, subjectStats } = data;

  const statCards = [
    { icon: 'school', label: 'Používateľov', value: String(stats.users), tone: 'primary' as const },
    { icon: 'library_books', label: 'Aktívnych predmetov', value: String(stats.subjects), tone: 'tertiary' as const },
    { icon: 'upload_file', label: 'Materiálov', value: String(stats.materials), tone: 'success' as const },
    { icon: 'quiz', label: 'Absolvovaných testov', value: String(stats.testResults), tone: 'warning' as const },
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow icon="shield_person">Administrácia</Eyebrow>
          <Serif size={40} weight={700} style={{ display: 'block', margin: '8px 0', fontSize: 'clamp(28px, 6vw, 40px)' }}>Admin Dashboard</Serif>
          <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Prehľad MaturitaKB.</div>
        </div>
        <div className="mkb-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
            <input placeholder="Hľadať…" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 9999, padding: '9px 16px 9px 38px', width: 220, color: 'var(--on-surface)', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; }} />
          </div>
          <button onClick={() => flash('Žiadne nové notifikácie')} style={{ width: 38, height: 38, borderRadius: 9999, background: 'var(--surface-container-high)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="notifications" size={20} />
          </button>
        </div>
      </header>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 32, overflowX: 'auto' }}>
        {[['overview', 'Prehľad'], ['subjects', 'Predmety'], ['users', 'Používatelia'], ['reports', 'Reporty']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Activity table */}
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={22} weight={600}>Posledné výsledky testov</Serif>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Zobraziť všetko</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                {['Používateľ', 'Test', 'Predmet', 'Skóre', 'Čas'].map((h, i) => (
                  <th key={h} style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', color: 'var(--on-surface-variant)', padding: '0 0 10px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentResults.map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: i < recentResults.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                  <td style={{ padding: '12px 0', fontSize: 14, fontWeight: 600 }}>{r.user_name}</td>
                  <td style={{ padding: '12px 0', color: 'var(--on-surface-variant)', fontSize: 14 }}>{r.test_title}</td>
                  <td style={{ padding: '12px 0' }}><span style={{ background: 'var(--surface-container-highest)', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>{r.subject_name}</span></td>
                  <td style={{ padding: '12px 0', fontWeight: 700, color: r.score >= 70 ? 'var(--success)' : 'var(--error)', fontSize: 15 }}>{r.score}%</td>
                  <td style={{ padding: '12px 0', color: 'var(--on-surface-variant)', fontSize: 12 }}>{new Date(r.created_at).toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--panel-ink)', color: '#fff', borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--panel-ink-line) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .5 }} />
            <Serif size={22} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8, position: 'relative' }}>Pridať obsah</Serif>
            <div style={{ fontSize: 15, color: 'var(--panel-ink-variant)', marginBottom: 24, position: 'relative' }}>Vytvor a publikuj nové študijné materiály.</div>
            <div style={{ position: 'relative' }}><Button variant="white" icon="add" full onClick={() => flash('Otvára sa editor obsahu…')}>Vytvoriť materiál</Button></div>
          </div>

          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Stav systému</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Progress value={42} label="Záťaž servera" right="42%" height={8} />
              <Progress value={78} label="Databáza" right="78%" height={8} />
              <Progress value={99} label="Dostupnosť" right="99.9%" height={8} />
            </div>
          </Card>

          <Card pad={20} radius={12}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Rýchle akcie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['add_circle', 'Pridať predmet'], ['person_add', 'Pozvať študenta'], ['download', 'Exportovať reporty'], ['settings', 'Nastavenia systému']].map(([icon, label]) => (
                <button key={label as string} onClick={() => flash(`${label}…`)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}>
                  <Icon name={icon as string} size={16} style={{ color: 'var(--primary)' }} />{label}
                </button>
              ))}
            </div>
          </Card>

          {tab === 'subjects' || tab === 'overview' ? (
            <Card pad={20} radius={12}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Predmety</div>
              {subjectStats.slice(0, 5).map((s: any) => (
                <div key={s.name_sk} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                  <IconChip name={s.icon} size={28} radius={6} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name_sk}</div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{s.student_count} študentov · {s.material_count} mat.</div>
                  </div>
                </div>
              ))}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
