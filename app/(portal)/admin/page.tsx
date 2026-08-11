'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Serif, StatCard, Chip, Avatar } from '@/components/ui';
import { Counter } from '@/components/motion';
import { LineArea, HBars } from '@/components/charts';
import { AdminHeader, ROLE_META, relTime } from './_shared';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin').then(r => { if (r.status === 403) { router.push('/dashboard'); return null; } return r.json(); }).then(d => d && setData(d)).catch(() => {});
    fetch('/api/admin/charts').then(r => r.json()).then(setCharts).catch(() => {});
  }, []);

  if (!data) return (
    <div>
      <AdminHeader eyebrow="Administrácia" title="Prehľad" desc="Živý stav celej platformy MaturitaKB na jednom mieste." />
      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="mkb-skeleton" style={{ height: 110, borderRadius: 14 }} />)}
      </div>
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

  return (
    <div>
      <AdminHeader eyebrow="Administrácia" title="Prehľad" desc="Živý stav celej platformy MaturitaKB na jednom mieste."
        action={<Link href="/admin/analytics"><Chip tone="trend" icon="monitoring">Detailná analytika</Chip></Link>} />

      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
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
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Serif size={20} weight={600}>Posledné výsledky testov</Serif>
          <Link href="/admin/logs" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>Všetky logy →</Link>
        </div>
        <div className="mkb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>{['Používateľ', 'Test', 'Predmet', 'Skóre', 'Čas'].map(h => <th key={h} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '12px 22px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {data.recentResults.map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: i < data.recentResults.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                  <td style={{ padding: '11px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={r.user_name} size={30} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.user_name}</span>
                    </div>
                  </td>
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
  );
}
