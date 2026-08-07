'use client';
import { useState, useEffect } from 'react';
import { Icon, Card, IconChip, Progress, Chip, Serif, Eyebrow, Ring } from '@/components/ui';
import { Counter, Reveal } from '@/components/motion';
import { computeAchievements } from '@/lib/achievements';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/progress').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{ padding: 48, color: 'var(--on-surface-variant)' }}>Načítavam…</div>;

  const { progress, results, sessions, totals, testCount } = data;
  const avgProgress = progress.length > 0 ? Math.round(progress.reduce((s: number, p: any) => s + p.progress_pct, 0) / progress.length) : 0;

  const maxHours = sessions.length > 0 ? Math.max(...sessions.map((s: any) => Number(s.minutes) / 60)) : 8;

  const bestScore = results.length ? Math.max(...results.map((r: any) => Number(r.score) || 0)) : 0;
  const perfectCount = results.filter((r: any) => Number(r.score) >= 100).length;
  const totalHours = Number(totals?.total_hours || 0);
  const achievements = computeAchievements({
    testCount: Number(testCount) || 0, bestScore, avgProgress,
    subjectsCount: progress.length, sessionsCount: sessions.length, totalHours, perfectCount,
  });
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow icon="insights">Analytika</Eyebrow>
        <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>Môj pokrok</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Sleduj hodiny štúdia, výsledky testov a zvládnutie predmetov.</div>
      </header>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          ['trending_up', 'Celkový pokrok', `${avgProgress}%`, 'priemerný vo všetkých predmetoch'],
          ['schedule', 'Celkové hodiny', `${totals.total_hours}h`, 'tento semester'],
          ['quiz', 'Dokončené testy', String(testCount), 'úspešne absolvovaných'],
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

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
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

        {/* Achievements summary */}
        <Card pad={24} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
          <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 18, alignSelf: 'flex-start' }}>Odznaky</Serif>
          <Ring value={(earnedCount / achievements.length) * 100} size={128} stroke={11}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, lineHeight: 1 }}><Counter value={earnedCount} /></div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>z {achievements.length}</div>
            </div>
          </Ring>
          <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 16 }}>odomknutých odznakov</div>
        </Card>
      </div>

      {/* Achievements grid */}
      <Card pad={24} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <Serif size={20} weight={600}>Achievementy</Serif>
          <Chip tone="trend" icon="military_tech">{earnedCount} / {achievements.length}</Chip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {achievements.map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i * 25, 300)}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 14, border: `1px solid ${a.earned ? 'var(--primary)' : 'var(--outline-variant)'}`, background: a.earned ? 'var(--primary-fixed)' : 'var(--surface-container-low)', height: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.earned ? 'var(--primary)' : 'var(--surface-container-high)', color: a.earned ? 'var(--on-primary)' : 'var(--on-surface-variant)' }}>
                  <Icon name={a.icon} size={22} fill={a.earned ? 1 : 0} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: a.earned ? 'var(--on-primary-fixed)' : 'var(--on-surface)' }}>{a.title}</span>
                    {a.earned && <Icon name="check_circle" size={15} fill={1} style={{ color: 'var(--primary)' }} />}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', marginTop: 3, lineHeight: 1.4 }}>{a.desc}</div>
                  {!a.earned && a.need > 1 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 5, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(a.have / a.need) * 100}%`, background: 'var(--primary)', borderRadius: 9999 }} />
                      </div>
                      <div className="mkb-mono" style={{ fontSize: 10.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>{a.have} / {a.need}</div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Card>

      {/* Subject breakdown */}
      <Card pad={24} radius={12} style={{ marginBottom: 24 }}>
        <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 24 }}>Prehľad predmetov</Serif>
        {progress.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {progress.map((p: any) => (
              <div key={p.subject_id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 46px 68px', gap: 12, alignItems: 'center', minWidth: 0 }}>
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
