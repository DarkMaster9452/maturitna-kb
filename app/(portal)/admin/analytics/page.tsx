'use client';
import { useState, useEffect } from 'react';
import { Card, Serif, Chip, Icon } from '@/components/ui';
import { LineArea, Bars, Donut, HBars, KpiTile, Heatmap } from '@/components/charts';
import { AdminHeader, ROLE_META } from '../_shared';

const WEEKDAYS = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
const DAYPARTS = ['Ráno', 'Doobeda', 'Poobede', 'Večer'];

export default function AnalyticsPage() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch('/api/admin/analytics').then(r => r.json()).then(setD).catch(() => {}); }, []);

  if (!d || !d.kpis) return (
    <div>
      <AdminHeader eyebrow="Analytika" title="Analytika" desc="Detailné čísla a trendy naprieč platformou." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>{[0, 1, 2, 3].map(i => <div key={i} className="mkb-skeleton" style={{ height: 120, borderRadius: 16 }} />)}</div>
    </div>
  );

  const funnel = d.funnel || {};
  const funnelSteps = [
    { label: 'Registrovaní', value: Number(funnel.total || 0), icon: 'group' },
    { label: 'Dokončený onboarding', value: Number(funnel.onboarded || 0), icon: 'how_to_reg' },
    { label: 'S predmetmi v pláne', value: Number(funnel.with_subjects || 0), icon: 'school' },
    { label: 'Absolvovali test', value: Number(funnel.with_tests || 0), icon: 'quiz' },
  ];
  const funnelMax = Math.max(1, funnelSteps[0].value);

  return (
    <div>
      <AdminHeader eyebrow="Analytika" title="Analytika" desc="Detailné čísla a trendy naprieč platformou."
        action={<Chip tone="soft" icon="calendar_month">Posledných 14 dní</Chip>} />

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 22 }}>
        <KpiTile label="Testy (7 dní)" value={d.kpis.tests.last} delta={d.kpis.tests.delta} spark={d.kpis.tests.spark} icon="fact_check" tone="primary" />
        <KpiTile label="Aktívni používatelia" value={d.kpis.active.last} delta={d.kpis.active.delta} spark={d.kpis.active.spark} icon="bolt" tone="success" />
        <KpiTile label="Noví používatelia" value={d.kpis.newUsers.last} delta={d.kpis.newUsers.delta} spark={d.kpis.newUsers.spark} icon="person_add" tone="tertiary" />
        <KpiTile label="Priemerné skóre" value={d.kpis.score.value} suffix="%" delta={d.kpis.score.delta} spark={d.kpis.score.spark} icon="grade" tone="warning" />
      </div>

      {/* Growth + tests */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Serif size={19} weight={600}>Rast používateľov</Serif>
            <Chip tone="trend">{funnel.total} spolu</Chip>
          </div>
          <LineArea data={d.series.usersCumulative || []} height={170} />
        </Card>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Dokončené testy / deň</Serif>
          <Bars data={(d.series.dailyTests || []).map((x: any) => ({ label: x.label, value: Number(x.value) }))} height={170} />
        </Card>
      </div>

      {/* Sessions + avg score */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>Hodiny štúdia / deň</Serif>
          <Bars data={(d.series.dailySessions || []).map((x: any) => ({ label: x.label, value: Number(x.value) }))} height={170} unit="h" />
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Serif size={19} weight={600}>Priemerné skóre v čase</Serif>
            <Chip tone={d.passRate >= 60 ? 'success' : 'warning'}>úspešnosť {d.passRate}%</Chip>
          </div>
          <LineArea data={(d.series.dailyScore || []).map((x: any) => ({ label: x.label, value: Number(x.value) }))} height={170} suffix="%" color="var(--warning)" />
        </Card>
      </div>

      {/* Donuts */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Rozdelenie rolí</Serif>
          <Donut data={(d.roleDist || []).map((r: any) => ({ label: ROLE_META[r.label]?.label || r.label, value: Number(r.value) }))} />
        </Card>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Rozdelenie skóre</Serif>
          <Donut data={(d.scoreBuckets || []).map((b: any) => ({ label: b.label, value: Number(b.value) }))}
            center={<><span style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{d.passRate}%</span><span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>úspešnosť</span></>} />
        </Card>
      </div>

      {/* Activity heatmap */}
      <Card style={{ marginBottom: 20 }}>
        <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 6 }}>Aktivita podľa dňa a času</Serif>
        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 18 }}>Kedy sú študenti najaktívnejší (testy + sessions).</div>
        <Heatmap rows={WEEKDAYS} cols={DAYPARTS} values={d.heatmap || []} />
      </Card>

      {/* Funnel */}
      <Card style={{ marginBottom: 20 }}>
        <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 20 }}>Zapojenie používateľov (funnel)</Serif>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {funnelSteps.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={step.icon} size={21} fill={1} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{step.label}</span>
                  <span className="mkb-mono" style={{ fontSize: 13, fontWeight: 700 }}>{step.value} · {Math.round((step.value / funnelMax) * 100)}%</span>
                </div>
                <div style={{ height: 12, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(step.value / funnelMax) * 100}%`, background: 'var(--primary)', borderRadius: 9999, opacity: 1 - i * 0.16, transition: 'width .7s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-subject + top students */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Študenti podľa predmetu</Serif>
          <HBars data={(d.bySubject || []).map((s: any) => ({ label: s.label, value: Number(s.students) }))} />
        </Card>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)' }}><Serif size={19} weight={600}>Najlepší študenti</Serif></div>
          {(d.topStudents || []).map((s: any, i: number) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <span className="mkb-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface-variant)', width: 20 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <Chip tone="soft" icon="quiz">{s.tests}</Chip>
              <Chip tone={s.avg_progress >= 66 ? 'success' : 'warning'}>{s.avg_progress}%</Chip>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
