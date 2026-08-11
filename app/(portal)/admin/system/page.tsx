'use client';
import { useState, useEffect } from 'react';
import { Card, Serif, IconChip, Chip } from '@/components/ui';
import { Counter } from '@/components/motion';
import { LineArea, Bars, HBars, Donut } from '@/components/charts';
import { AdminHeader } from '../_shared';

const SERVICES: [string, string][] = [
  ['Aplikácia (Next.js)', 'bolt'],
  ['Databáza (Neon Postgres)', 'database'],
  ['Autentifikácia (JWT)', 'lock'],
  ['Úložisko súborov', 'folder'],
  ['API vrstva', 'api'],
  ['Plánovač úloh', 'schedule'],
];

export default function AdminSystemPage() {
  const [data, setData] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(setData).catch(() => {});
    fetch('/api/admin/charts').then(r => r.json()).then(setCharts).catch(() => {});
  }, []);

  const s = data?.stats;
  const rows: [string, any, string][] = s ? [
    ['Používatelia', s.users, 'group'], ['Predmety', s.subjects, 'school'], ['Okruhy', s.okruhy, 'category'],
    ['Materiály', s.materials, 'upload_file'], ['Testy', s.tests, 'quiz'], ['Výsledky', s.testResults, 'fact_check'],
    ['Poznámky', s.notes, 'edit_note'],
  ] : [];
  const totalRows = rows.reduce((a, r) => a + Number(r[1] || 0), 0);

  return (
    <div>
      <AdminHeader eyebrow="Systém" title="Stav systému" desc="Beh služieb, dátové objemy a technické metriky platformy v reálnom čase."
        action={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: 'var(--success)' }}><span className="mkb-pulse" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--success)' }} /> Všetko beží</span>} />

      {/* Services */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="mkb-eyebrow">Stav služieb</span>
          <Chip tone="success" icon="check_circle">6 / 6 aktívnych</Chip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {SERVICES.map(([name, icon]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 12, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
              <IconChip name={icon} size={34} radius={9} />
              <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{name}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--success)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> OK</span>
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

      {/* DB composition + row counts */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }}>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>Zloženie databázy</Serif>
          {rows.length > 0 && <Donut data={rows.map(r => ({ label: r[0], value: Number(r[1] || 0) }))}
            center={<><span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}><Counter value={totalRows} /></span><span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>záznamov</span></>} />}
        </Card>
        <Card>
          <span className="mkb-eyebrow">Databáza — počet záznamov</span>
          <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16 }}>
            {rows.map(([label, val, icon]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 12, border: '1px solid var(--outline-variant)' }}>
                <IconChip name={icon} size={34} radius={9} />
                <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, lineHeight: 1 }}><Counter value={Number(val)} /></div><div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 2 }}>{label}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
