'use client';
import { useState, useEffect } from 'react';
import { Icon, Card, IconChip, Progress, Chip, Serif, Eyebrow } from '@/components/ui';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/progress').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const { progress, results, sessions, totals, testCount } = data;
  const avgProgress = progress.length > 0 ? Math.round(progress.reduce((s: number, p: any) => s + p.progress_pct, 0) / progress.length) : 0;

  const maxHours = sessions.length > 0 ? Math.max(...sessions.map((s: any) => Number(s.minutes) / 60)) : 8;

  const achievements = [
    { icon: 'emoji_events', label: 'Prvý test', date: 'Oct 5', bg: 'var(--primary-fixed)', c: 'var(--primary)', earned: Number(testCount) >= 1 },
    { icon: 'local_fire_department', label: '7-dňová séria', date: 'Oct 12', bg: '#ffe0cc', c: '#c45f00', earned: true },
    { icon: 'star', label: 'Skóre 90%+', date: 'Oct 18', bg: '#fff3c4', c: '#a07000', earned: results.some((r: any) => r.score >= 90) },
    { icon: 'military_tech', label: '10 testov', date: 'Oct 24', bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)', earned: Number(testCount) >= 10 },
  ];

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Analytika</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Môj pokrok</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Sleduj hodiny štúdia, výsledky testov a zvládnutie predmetov.</div>
      </header>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          ['trending_up', 'Celkový pokrok', `${avgProgress}%`, 'priemerný vo všetkých predmetoch'],
          ['schedule', 'Celkové hodiny', `${totals.total_hours}h`, 'tento semester'],
          ['quiz', 'Dokončené testy', String(testCount), `z ${results.length + 5} naplánovaných`],
          ['school', 'Aktívne predmety', String(progress.length), 'predmetov v pláne'],
        ].map(([icon, label, val, sub]) => (
          <Card key={label as string} pad={20} radius={12} style={{ boxShadow: 'var(--shadow-card)' }}>
            <IconChip name={icon as string} size={40} radius={10} />
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 12, marginBottom: 4 }}>{label}</div>
            <Serif size={28} weight={700} style={{ display: 'block' }}>{val}</Serif>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>{sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Bar chart */}
        <Card pad={24} radius={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Serif size={20} weight={600}>Hodiny štúdia (posledné sessions)</Serif>
            <Chip tone="soft">Posledné záznamy</Chip>
          </div>
          {sessions.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140 }}>
              {sessions.map((s: any, i: number) => {
                const hrs = Number(s.minutes) / 60;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{hrs.toFixed(1)}h</div>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: i === 0 ? 'var(--primary)' : 'var(--primary-fixed)', height: Math.max((hrs / maxHours) * 110, 4) }} />
                    <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', fontWeight: 600 }}>{new Date(s.day).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' })}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', fontSize: 15 }}>
              Zatiaľ žiadne zaznamenané sessions.
            </div>
          )}
        </Card>

        {/* Achievements */}
        <Card pad={24} radius={12}>
          <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 20 }}>Odznaky</Serif>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {achievements.map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: a.earned ? 1 : 0.4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Icon name={a.icon} size={18} fill={1} style={{ color: a.c }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{a.earned ? a.date : 'Zatiaľ nezískaný'}</div>
                </div>
                {a.earned && <Icon name="check_circle" size={16} fill={1} style={{ color: 'var(--success)' }} />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subject breakdown */}
      <Card pad={24} radius={12} style={{ marginBottom: 24 }}>
        <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 24 }}>Prehľad predmetov</Serif>
        {progress.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {progress.map((p: any) => (
              <div key={p.subject_id} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 60px 80px', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconChip name={p.icon} size={32} radius={8} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name_sk}</span>
                </div>
                <Progress value={p.progress_pct} height={8} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', textAlign: 'center' }}>{p.progress_pct}%</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', textAlign: 'right' }}>{p.study_hours}h štúdia</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--on-surface-variant)' }}>Zatiaľ žiadne dáta o pokroku.</div>
        )}
      </Card>

      {/* Recent test results */}
      {results.length > 0 && (
        <Card pad={24} radius={12}>
          <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 20 }}>Posledné výsledky testov</Serif>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {results.slice(0, 8).map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < Math.min(results.length, 8) - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{r.name_sk}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(r.created_at).toLocaleDateString('sk-SK')}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: r.score >= 70 ? 'var(--success)' : 'var(--error)', minWidth: 48, textAlign: 'right' }}>{r.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
