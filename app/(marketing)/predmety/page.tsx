'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, IconChip, Serif, Eyebrow, SkeletonCard } from '@/components/ui';
import { BackLink } from '../_components';

type Subject = { id: string; slug: string; name_sk: string; icon: string; description_sk: string };

export default function PredmetyPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <BackLink />
      <header style={{ marginBottom: 40 }}>
        <Eyebrow>Predmety maturity</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0', fontSize: 'clamp(34px, 7vw, 52px)' }}>Predmety</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Všetky maturitné predmety s materiálmi a cvičnými testami.</div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)
          : subjects.map(s => (
            <Link key={s.id} href="/login" style={{ textDecoration: 'none' }}>
              <Card hover pad={24} radius={12} style={{ cursor: 'pointer', height: '100%' }}>
                <IconChip name={s.icon} size={48} radius={12} />
                <Serif size={20} weight={600} style={{ display: 'block', margin: '16px 0 8px' }}>{s.name_sk}</Serif>
                <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{s.description_sk}</div>
                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Zobraziť materiály →</div>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
