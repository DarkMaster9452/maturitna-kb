'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Ring, Chip, Serif, Eyebrow, Skeleton, StatCard, Avatar, EmptyState } from '@/components/ui';
import { Counter } from '@/components/motion';
import { useT, subjectName } from '@/components/i18n';
import { useUser } from '../layout';

export default function DashboardPage() {
  const { user, pinnedSubjects, userData } = useUser();
  const { t, lang } = useT();
  const [results, setResults] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/progress')
      .then(r => r.json())
      .then(d => setResults(Array.isArray(d.results) ? d.results : []))
      .catch(() => setResults([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 10 ? t('Dobré ráno') : hour < 18 ? t('Ahoj') : t('Dobrý večer');

  const selected = userData?.selected || [];
  const progressList = userData?.progress || [];
  const resumeList = pinnedSubjects.length > 0 ? pinnedSubjects : selected;
  const resume = resumeList[0];
  const avgProgress = progressList.length
    ? Math.round(progressList.reduce((a: number, p: any) => a + (p.progress_pct || 0), 0) / progressList.length)
    : 0;
  const recentResults = results.slice(0, 4);
  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + (r.score || 0), 0) / results.length) : 0;

  const subtitle = selected.length > 0 ? t('Pokračuj tam, kde si skončil.') : t('Začni výberom predmetov, ktoré maturuješ.');

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16 }}>
        <div>
          <Eyebrow icon="calendar_today">{today}</Eyebrow>
          <Serif size={44} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(28px, 6vw, 46px)' }}>
            {greeting}, {user?.name?.split(' ')[0] || 'študent'}.
          </Serif>
          <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--on-surface-variant)', maxWidth: 560 }}>{subtitle}</div>
        </div>
        <Link href="/settings" className="mkb-hide-mobile"><Avatar name={user?.name} size={52} /></Link>
      </header>

      {/* Stats */}
      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="school" label={t('Predmety v pláne')} value={<Counter value={selected.length} />} sub={`${pinnedSubjects.length} ${t('pripnutých')}`} tone="primary" />
        <StatCard icon="trending_up" label={t('Priemerný pokrok')} value={<Counter value={avgProgress} suffix="%" />} sub={t('naprieč predmetmi')} tone="tertiary" />
        <StatCard icon="quiz" label={t('Dokončené testy')} value={<Counter value={results.length} />} sub={results.length ? `${t('priemer')} ${avgScore} %` : t('zatiaľ žiadne')} tone="success" />
        <StatCard icon="local_fire_department" label={t('Pripravenosť')} value={avgProgress >= 66 ? t('Vysoká') : avgProgress >= 33 ? t('Stredná') : t('Začiatok')} sub={t('odhad podľa pokroku')} tone="warning" />
      </div>

      <div className="mkb-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero resume card */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 28, background: 'var(--panel-ink)' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--panel-ink-line) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .5 }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  <Icon name={resume ? 'bookmark' : 'rocket_launch'} size={15} fill={1} />{resume ? t('Pokračuj v štúdiu') : t('Začni tu')}
                </span>
                <Serif size={30} weight={700} style={{ display: 'block', margin: '12px 0 6px', color: '#fff' }}>{resume ? subjectName(resume, lang) : t('Vyber si predmety')}</Serif>
                <div style={{ fontSize: 15.5, color: 'var(--panel-ink-variant)', maxWidth: 420 }}>{resume ? ((lang === 'en' ? resume.description_en : resume.description_sk) || t('Otvor si okruhy a materiály tohto predmetu.')) : t('Pridaj predmety, ktoré maturuješ, a pripni si ich do menu.')}</div>
              </div>
              <Button variant="white" iconAfter="arrow_forward" onClick={() => router.push(resume ? `/subjects/${resume.slug}` : '/subjects')}>
                {resume ? t('Pokračovať') : t('Vybrať predmety')}
              </Button>
            </div>
          </div>

          {/* Pinned subjects */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Serif size={22} weight={600}>{pinnedSubjects.length > 0 ? t('Pripnuté predmety') : t('Tvoje predmety')}</Serif>
            <Link href="/subjects" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
              {t('Všetky')} <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {resumeList.length === 0 ? (
            <Card><EmptyState icon="school" title={t('Zatiaľ žiadne predmety')} desc={t('Vyber si predmety, ktoré maturuješ, a začni si organizovať okruhy.')} action={<Link href="/subjects"><Button icon="add">{t('Vybrať predmety')}</Button></Link>} /></Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
              {resumeList.slice(0, 4).map((s: any) => {
                const prog = progressList.find((p: any) => p.subject_id === s.id);
                const pct = prog?.progress_pct || 0;
                return (
                  <Link key={s.id} href={`/subjects/${s.slug}`} style={{ textDecoration: 'none' }}>
                    <Card hover style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                        <IconChip name={s.icon} size={44} grad={pct >= 66} />
                        <Ring value={pct} size={46} stroke={5} />
                      </div>
                      <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 4 }}>{subjectName(s, lang)}</Serif>
                      <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.45, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{(lang === 'en' ? s.description_en : s.description_sk) || s.description_sk}</div>
                    </Card>
                  </Link>
                );
              })}
              <Link href="/subjects">
                <button style={{ background: 'var(--surface-container)', border: '1.5px dashed var(--outline-variant)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 176, width: '100%', height: '100%', transition: 'background .2s, border-color .2s', color: 'var(--on-surface-variant)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container-high)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="add" /></div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t('Pridať predmet')}</span>
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card glow>
            <Serif size={19} weight={600} style={{ display: 'block', marginBottom: 20 }}>{t('Nedávna aktivita')}</Serif>
            {activityLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[0, 1, 2].map(i => <Skeleton key={i} height={40} />)}</div>
            ) : recentResults.length > 0 ? (
              <div style={{ position: 'relative', borderLeft: '2px solid var(--outline-variant)', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 22 }}>
                {recentResults.map((r: any, i: number) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 22 }}>
                    <div style={{ position: 'absolute', width: 11, height: 11, borderRadius: '50%', left: -6.5, top: 4, background: i === 0 ? 'var(--primary)' : 'var(--surface-container-high)', boxShadow: '0 0 0 4px var(--surface-container-lowest)' }} />
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{r.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <Chip tone={r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'}>{r.score}%</Chip>
                      <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{subjectName(r, lang)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'sk-SK')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 12px', color: 'var(--on-surface-variant)' }}>
                <Icon name="history" size={34} style={{ opacity: .4, display: 'block', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14 }}>{t('Zatiaľ žiadna aktivita.')}</div>
              </div>
            )}
            <Link href="/progress"><Button variant="secondary" full style={{ marginTop: 22 }}>{t('Zobraziť celú históriu')}</Button></Link>
          </Card>

          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, padding: 22, background: 'var(--panel-ink)' }}>
            <Serif size={18} weight={600} style={{ color: '#fff', display: 'block', marginBottom: 8 }}>{t('Otestuj sa')}</Serif>
            <div style={{ fontSize: 14, color: 'var(--panel-ink-variant)', marginBottom: 18, lineHeight: 1.5 }}>{t('Precvič si témy cvičnými testami a over si, čo už vieš.')}</div>
            <Link href="/tests"><Button variant="white" full icon="quiz">{t('Spustiť test')}</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
