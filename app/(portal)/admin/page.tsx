'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow } from '@/components/ui';
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
    { icon: 'school', bg: 'var(--primary-fixed)', color: 'var(--primary)', label: 'Celkovo študentov', value: String(stats.users), trend: '+12% tento mesiac', tBg: 'var(--primary-fixed-dim)', tC: 'var(--primary)' },
    { icon: 'library_books', bg: 'var(--tertiary-fixed)', color: 'var(--tertiary)', label: 'Aktívne predmety', value: String(stats.subjects), trend: 'Stabilné', tBg: 'var(--tertiary-fixed-dim)', tC: 'var(--tertiary)' },
    { icon: 'upload_file', bg: 'var(--secondary-container)', color: 'var(--secondary)', label: 'Materiálov', value: String(stats.materials), trend: '+5 dnes', tBg: 'var(--secondary-fixed)', tC: 'var(--secondary)' },
    { icon: 'quiz', bg: 'var(--primary-fixed)', color: 'var(--primary)', label: 'Absolvovaných testov', value: String(stats.testResults), trend: '+1 240 tento týždeň', tBg: 'var(--primary-fixed-dim)', tC: 'var(--primary)' },
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Eyebrow>Administrácia</Eyebrow>
          <Serif size={40} weight={700} style={{ display: 'block', margin: '8px 0' }}>Admin Dashboard</Serif>
          <div style={{ fontSize: 17, color: 'var(--on-surface-variant)' }}>Prehľad Maturita Knowledge Base.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--outline-variant)', marginBottom: 32 }}>
        {[['overview', 'Prehľad'], ['subjects', 'Predmety'], ['users', 'Používatelia'], ['reports', 'Reporty']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {statCards.map(s => (
          <Card key={s.label} hover pad={20} radius={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <IconChip name={s.icon} size={44} bg={s.bg} color={s.color} radius={10} />
              <span style={{ fontSize: 11, fontWeight: 600, color: s.tC, background: s.tBg, padding: '4px 10px', borderRadius: 9999 }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 4 }}>{s.label}</div>
            <Serif size={36} weight={700}>{s.value}</Serif>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Activity table */}
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={22} weight={600}>Posledné výsledky testov</Serif>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Zobraziť všetko</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 128, height: 128, background: '#fff', opacity: .1, borderRadius: '0 0 0 9999px' }} />
            <Serif size={22} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Pridať obsah</Serif>
            <div style={{ fontSize: 15, opacity: .9, marginBottom: 24 }}>Vytvor a publikuj nové študijné materiály.</div>
            <Button variant="white" icon="add" full onClick={() => flash('Otvára sa editor obsahu…')}>Vytvoriť materiál</Button>
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
