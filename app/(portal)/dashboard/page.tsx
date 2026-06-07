'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow, Skeleton } from '@/components/ui';
import { useUser, useToastCtx } from '../layout';

export default function DashboardPage() {
  const { user, pinnedSubjects, userData } = useUser();
  const { flash } = useToastCtx();
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(d => setRecentResults(d.results?.slice(0, 4) || []))
      .catch(() => setRecentResults([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const selected = userData?.selected || [];
  const progressList = userData?.progress || [];
  const resumeList = pinnedSubjects.length > 0 ? pinnedSubjects : selected;
  const resume = resumeList[0];
  const avgProgress = progressList.length
    ? Math.round(progressList.reduce((a: number, p: any) => a + (p.progress_pct || 0), 0) / progressList.length)
    : 0;

  const subtitle = selected.length > 0
    ? `Máš ${selected.length} ${selected.length === 1 ? 'predmet' : selected.length < 5 ? 'predmety' : 'predmetov'} vo svojom pláne.`
    : 'Začni výberom predmetov, ktoré maturuješ.';

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 32, gap: 16 }}>
        <div>
          <Eyebrow>{today}</Eyebrow>
          <Serif size={44} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>
            Vitaj späť, {user?.name?.split(' ')[0] || 'študent'}.
          </Serif>
          <div style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)', maxWidth: 540 }}>
            {subtitle}
          </div>
        </div>
        <Link href="/settings">
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--outline-variant)', cursor: 'pointer', flex: 'none' }}>
            <Serif size={18} weight={700} style={{ color: 'var(--primary)' }}>{user?.name?.[0] || '?'}</Serif>
          </div>
        </Link>
      </header>

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero resume card — real data, or a neutral prompt */}
          <Card radius={16} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 256, height: 256, background: 'var(--primary-fixed)', opacity: .25, borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {resume ? (
                <>
                  <div>
                    <Chip tone="soft" icon="bookmark">Pripnutý predmet</Chip>
                    <Serif size={32} weight={700} style={{ display: 'block', margin: '12px 0 4px' }}>{resume.name_sk}</Serif>
                    <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>{resume.description_sk || 'Pokračuj v štúdiu'}</div>
                  </div>
                  <Button onClick={() => router.push(`/subjects/${resume.slug}`)}>Pokračovať</Button>
                </>
              ) : (
                <>
                  <div>
                    <Chip tone="soft" icon="rocket_launch">Začni tu</Chip>
                    <Serif size={32} weight={700} style={{ display: 'block', margin: '12px 0 4px' }}>Vyber si predmety</Serif>
                    <div style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>Pridaj predmety, ktoré maturuješ, a pripni si ich.</div>
                  </div>
                  <Button onClick={() => router.push('/subjects')}>Vybrať predmety</Button>
                </>
              )}
            </div>
          </Card>

          {/* Pinned subjects */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Serif size={24} weight={600}>Pripnuté predmety</Serif>
            <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
              Zobraziť všetky <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {resumeList.slice(0, 3).map((s: any) => {
              const prog = progressList.find((p: any) => p.subject_id === s.id);
              return (
                <Link key={s.id} href={`/subjects/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <Card hover style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', height: '100%' }}>
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
              <button style={{ background: 'var(--surface-container)', border: '1px dashed var(--outline-variant)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 196, cursor: 'pointer', width: '100%', height: '100%', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-container)'}>
                <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
                  <Icon name="add" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{resumeList.length ? 'Pridať predmet' : 'Vybrať predmety'}</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Real stats, derived from the user's own data */}
          <Card>
            <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 16 }}>Tvoj prehľad</Serif>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Predmety v pláne</span>
                <span style={{ fontWeight: 700 }}>{selected.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Pripnuté predmety</span>
                <span style={{ fontWeight: 700 }}>{pinnedSubjects.length}</span>
              </div>
              <Progress value={avgProgress} label="Priemerný pokrok" right={avgProgress + '%'} height={6} />
            </div>
          </Card>

          <Card>
            <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 24 }}>Nedávna aktivita</Serif>
            {activityLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[0, 1, 2].map(i => <Skeleton key={i} height={40} />)}
              </div>
            ) : recentResults.length > 0 ? (
              <div style={{ position: 'relative', borderLeft: '2px solid var(--surface-container-high)', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {recentResults.map((r: any, i: number) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 24 }}>
                    <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', left: -7, top: 5, background: i === 0 ? 'var(--primary)' : 'var(--surface-container-high)', boxShadow: '0 0 0 4px var(--surface-container-lowest)' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Test dokončený: {r.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 4 }}>Skóre: {r.score}% — {r.name_sk}</div>
                    <div style={{ fontSize: 12, color: 'var(--tertiary)' }}>{new Date(r.created_at).toLocaleDateString('sk-SK')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--on-surface-variant)' }}>
                <Icon name="history" size={36} style={{ opacity: .4, display: 'block', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14 }}>Zatiaľ žiadna aktivita.</div>
              </div>
            )}
            <Link href="/progress">
              <Button variant="secondary" full style={{ marginTop: 24 }}>Zobraziť celú históriu</Button>
            </Link>
          </Card>

          <Card pad={20} radius={12} style={{ background: 'var(--primary)', border: 'none' }}>
            <Serif size={18} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Otestuj sa</Serif>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', marginBottom: 16 }}>Precvič si témy cvičnými testami.</div>
            <Link href="/tests">
              <Button variant="white" full icon="quiz">Spustiť test</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
