'use client';
import { useState, useEffect } from 'react';
import { Icon, Card, IconChip, Serif, Eyebrow, Ring, Chip, StatCard, EmptyState } from '@/components/ui';
import { Counter, Reveal } from '@/components/motion';
import { LineArea, Bars, HBars } from '@/components/charts';
import { computeAchievements } from '@/lib/achievements';
import { useT, subjectName } from '@/components/i18n';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const { t, lang } = useT();

  useEffect(() => { fetch('/api/progress').then(r => r.json()).then(setData); }, []);

  if (!data) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 16 }}>
      {[0, 1, 2, 3].map(i => <div key={i} className="mkb-skeleton" style={{ height: 110, borderRadius: 14 }} />)}
    </div>
  );

  const { progress, results, sessions, totals, testCount } = data;
  const avgProgress = progress.length > 0 ? Math.round(progress.reduce((s: number, p: any) => s + p.progress_pct, 0) / progress.length) : 0;
  const bestScore = results.length ? Math.max(...results.map((r: any) => Number(r.score) || 0)) : 0;
  const perfectCount = results.filter((r: any) => Number(r.score) >= 100).length;
  const totalHours = Number(totals?.total_hours || 0);
  const achievements = computeAchievements({ testCount: Number(testCount) || 0, bestScore, avgProgress, subjectsCount: progress.length, sessionsCount: sessions.length, totalHours, perfectCount });
  const earnedCount = achievements.filter(a => a.earned).length;

  const scoreSeries = [...results].reverse().map((r: any) => ({ label: new Date(r.created_at).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' }), value: Number(r.score) }));
  const hoursSeries = [...sessions].reverse().map((s: any) => ({ label: new Date(s.day).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit' }), value: Math.round((Number(s.minutes) / 60) * 10) / 10 }));
  const mastery = progress.map((p: any) => ({ label: subjectName(p, lang), value: p.progress_pct }));

  // group achievements
  const groups: Record<string, typeof achievements> = {};
  achievements.forEach(a => { (groups[a.group] = groups[a.group] || []).push(a); });

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow icon="insights">{t('Analytika')}</Eyebrow>
        <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>{t('Môj pokrok')}</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>{t('Sleduj hodiny štúdia, výsledky testov a zvládnutie predmetov.')}</div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="trending_up" label={t('Celkový pokrok')} value={<Counter value={avgProgress} suffix="%" />} tone="primary" />
        <StatCard icon="schedule" label={t('Celkové hodiny')} value={<Counter value={totalHours} suffix="h" />} tone="tertiary" />
        <StatCard icon="quiz" label={t('Dokončené testy')} value={<Counter value={Number(testCount)} />} tone="success" />
        <StatCard icon="workspace_premium" label={t('Odznaky')} value={<Counter value={earnedCount} />} sub={`z ${achievements.length}`} tone="warning" />
      </div>

      {/* Charts */}
      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <Serif size={19} weight={600}>{t('Skóre v čase')}</Serif>
            {bestScore > 0 && <Chip tone="success">max {bestScore}%</Chip>}
          </div>
          {scoreSeries.length > 0 ? <LineArea data={scoreSeries} height={170} suffix="%" /> : <EmptyState icon="show_chart" title={t('Zatiaľ žiadne výsledky')} />}
        </Card>
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 18 }}>{t('Hodiny štúdia')}</Serif>
          {hoursSeries.length > 0 ? <Bars data={hoursSeries} height={170} unit="h" /> : <EmptyState icon="bar_chart" title={t('Žiadne sessions')} />}
        </Card>
      </div>

      {/* Subject mastery */}
      <Card style={{ marginBottom: 24 }}>
        <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 20 }}>{t('Zvládnutie predmetov')}</Serif>
        {mastery.length > 0 ? <HBars data={mastery} /> : <EmptyState icon="school" title={t('Žiadne dáta o pokroku')} />}
      </Card>

      {/* Achievements */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22, flexWrap: 'wrap' }}>
          <Ring value={(earnedCount / achievements.length) * 100} size={92} stroke={9}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1 }}><Counter value={earnedCount} /></div>
              <div style={{ fontSize: 10.5, color: 'var(--on-surface-variant)' }}>z {achievements.length}</div>
            </div>
          </Ring>
          <div>
            <Serif size={22} weight={600} style={{ display: 'block' }}>{t('Achievementy')}</Serif>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>{t('odomknutých odznakov')}</div>
          </div>
        </div>

        {Object.entries(groups).map(([group, items]) => (
          <div key={group} style={{ marginTop: 20 }}>
            <div className="mkb-eyebrow" style={{ letterSpacing: '.12em', marginBottom: 12, display: 'block' }}>{group} · {items.filter(a => a.earned).length}/{items.length}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
              {items.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 18, 200)}>
                  <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: 12, borderRadius: 12, border: `1px solid ${a.earned ? 'var(--primary)' : 'var(--outline-variant)'}`, background: a.earned ? 'var(--primary-fixed)' : 'var(--surface-container-low)', height: '100%' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.earned ? 'var(--primary)' : 'var(--surface-container-high)', color: a.earned ? 'var(--on-primary)' : 'var(--on-surface-variant)' }}>
                      <Icon name={a.icon} size={19} fill={a.earned ? 1 : 0} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.earned ? 'var(--on-primary-fixed)' : 'var(--on-surface)' }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 2, lineHeight: 1.35 }}>{a.desc}</div>
                      {!a.earned && a.need > 1 && (
                        <div style={{ marginTop: 7 }}>
                          <div style={{ height: 4, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(a.have / a.need) * 100}%`, background: 'var(--primary)', borderRadius: 9999 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Recent results */}
      {results.length > 0 && (
        <Card>
          <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 16 }}>{t('Posledné výsledky testov')}</Serif>
          <div>
            {results.slice(0, 8).map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < Math.min(results.length, 8) - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{subjectName(r, lang)}</div>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(r.created_at).toLocaleDateString('sk-SK')}</span>
                  <Chip tone={r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'}>{r.score}%</Chip>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
