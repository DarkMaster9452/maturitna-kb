'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow, useToast, Toast } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

export default function DashboardPage() {
  const { user, pinnedSubjects } = useUser();
  const { flash } = useToastCtx();
  const [userData, setUserData] = useState<any>(null);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/subjects').then(r => r.json()).then(d => setUserData(d));
    fetch('/api/progress').then(r => r.json()).then(d => setRecentResults(d.results?.slice(0, 4) || []));
  }, []);

  const today = new Date().toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 32 }}>
        <div>
          <Eyebrow>{today}</Eyebrow>
          <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>
            Vitaj späť, {user?.name?.split(' ')[0] || 'Martin'}.
          </Serif>
          <div style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)', maxWidth: 540 }}>
            Tvoj študijný plán je na správnej ceste. Máš dva cvičné testy tento týždeň.
          </div>
        </div>
        <Link href="/settings">
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--outline-variant)', cursor: 'pointer' }}>
            <Serif size={18} weight={700} style={{ color: 'var(--primary)' }}>{user?.name?.[0] || 'M'}</Serif>
          </div>
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero resume card */}
          <Card radius={16} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 256, height: 256, background: 'var(--primary-fixed)', opacity: .25, borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <Chip tone="soft" icon="schedule">Naposledy prístupné pred 2 hodinami</Chip>
                <Serif size={36} weight={700} style={{ display: 'block', margin: '12px 0 4px' }}>Matematika: Integrály</Serif>
                <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Kapitola 4: Pokročilé techniky</div>
              </div>
              <Button onClick={() => { flash('Pokračujem v Matematika: Integrály…'); router.push('/subjects/matematika'); }}>
                Pokračovať
              </Button>
            </div>
          </Card>

          {/* Pinned subjects */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Serif size={24} weight={600}>Pripnuté predmety</Serif>
            <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
              Zobraziť všetky <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {(pinnedSubjects.length > 0 ? pinnedSubjects : userData?.selected?.slice(0, 3) || []).map((s: any) => {
              const prog = userData?.progress?.find((p: any) => p.subject_id === s.id);
              return (
                <Link key={s.id} href={`/subjects/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <Card hover style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <IconChip name={s.icon} size={40} />
                      <Serif size={20} weight={600}>{s.name_sk}</Serif>
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 24, flex: 1 }}>{s.description_sk}</div>
                    <Progress value={prog?.progress_pct || 0} label="Pokrok" right={(prog?.progress_pct || 0) + '%'} />
                  </Card>
                </Link>
              );
            })}
            <Link href="/subjects">
              <button style={{ background: 'var(--surface-container)', border: '1px dashed var(--outline-variant)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 196, cursor: 'pointer', width: '100%', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-container)'}>
                <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
                  <Icon name="add" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Pridať predmet</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card>
            <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 16 }}>Týždenné ciele</Serif>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Progress value={80} label="Hodiny štúdia" right="12 / 15 h" height={6} />
              <Progress value={33} label="Cvičné testy" right="1 / 3 hotové" height={6} />
              <Progress value={60} label="Materiály" right="6 / 10 prečítané" height={6} />
            </div>
          </Card>

          <Card>
            <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 24 }}>Nedávna aktivita</Serif>
            <div style={{ position: 'relative', borderLeft: '2px solid var(--surface-container-high)', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {recentResults.length > 0 ? recentResults.map((r: any, i: number) => (
                <div key={i} style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', left: -7, top: 5, background: i === 0 ? 'var(--primary)' : 'var(--surface-container-high)', boxShadow: '0 0 0 4px var(--surface-container-lowest)' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Test dokončený: {r.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Skóre: {r.score}% — {r.name_sk}</div>
                  <div style={{ fontSize: 12, color: 'var(--tertiary)' }}>{new Date(r.created_at).toLocaleDateString('sk-SK')}</div>
                </div>
              )) : [
                { t: 'Test dokončený: Derivácie', d: 'Skóre 92% — Matematika', w: 'Dnes, 10:30', on: true },
                { t: 'Prečítaný materiál', d: 'Slovenské národné obrodenie', w: 'Včera, 16:15' },
                { t: 'Spustená session', d: 'Matematika: Integrálny počet', w: '20. 10., 9:00' },
              ].map((a: any, i: number) => (
                <div key={i} style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', left: -7, top: 5, background: a.on ? 'var(--primary)' : 'var(--surface-container-high)', boxShadow: '0 0 0 4px var(--surface-container-lowest)' }} />
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.t}</div>
                  <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 4 }}>{a.d}</div>
                  <div style={{ fontSize: 12, color: 'var(--tertiary)' }}>{a.w}</div>
                </div>
              ))}
            </div>
            <Link href="/progress">
              <Button variant="secondary" full style={{ marginTop: 24 }}>Zobraziť celú históriu</Button>
            </Link>
          </Card>

          <Card pad={20} radius={12} style={{ background: 'var(--primary)', border: 'none' }}>
            <Serif size={18} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Rýchly test</Serif>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', marginBottom: 16 }}>Precvič si derivácie — 5 otázok, 10 min.</div>
            <Link href="/tests">
              <Button variant="white" full icon="quiz">Spustiť test</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
