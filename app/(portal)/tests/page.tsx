'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Chip, Serif, Eyebrow } from '@/components/ui';

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tests').then(r => r.json()).then(setTests);
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  const filtered = filter === 'all' ? tests : tests.filter((t: any) => t.subject_id === filter);

  const diffColor: Record<string, any> = {
    Easy: { bg: 'var(--success-container)', c: 'var(--success)' },
    Medium: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Hard: { bg: 'var(--error-container)', c: 'var(--error)' },
  };

  const bestScore = tests.length > 0 ? Math.max(...tests.filter(t => t.best_score).map(t => Number(t.best_score))) : 0;
  const totalAttempts = tests.reduce((sum: number, t: any) => sum + (Number(t.attempts) || 0), 0);

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow icon="quiz">Precvičovanie</Eyebrow>
          <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>Testy</Serif>
          <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Cvičné testy pre každý maturitný predmet.</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ padding: '10px 16px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>{totalAttempts}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Pokusov</div>
          </div>
          {bestScore > 0 && <div style={{ padding: '10px 16px', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>{bestScore}%</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Najlepší výsledok</div>
          </div>}
        </div>
      </header>

      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === 'all' ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: filter === 'all' ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--outline-variant)'}` }}>Všetky</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === s.id ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: filter === s.id ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)', border: `1px solid ${filter === s.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{s.name_sk}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {filtered.map((t: any) => (
          <Card key={t.id} hover pad={24} radius={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <IconChip name={t.icon} size={48} radius={12} />
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: diffColor[t.difficulty]?.bg, color: diffColor[t.difficulty]?.c, alignSelf: 'flex-start' }}>{t.difficulty}</span>
            </div>
            <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 6 }}>{t.title}</Serif>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>{t.name_sk}</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="quiz" size={14} />{t.question_count} otázok</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="schedule" size={14} />{t.duration_minutes} min</span>
              {t.attempts > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="replay" size={14} />{t.attempts}×</span>}
            </div>
            {t.best_score && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--surface-container)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Najlepší výsledok</span>
                <strong style={{ color: 'var(--primary)' }}>{t.best_score}%</strong>
              </div>
            )}
            <Link href={`/tests/${t.id}`} style={{ textDecoration: 'none' }}>
              <Button variant={t.attempts > 0 ? 'secondary' : 'primary'} full icon="play_arrow">
                {t.attempts > 0 ? 'Znova' : 'Spustiť test'}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
