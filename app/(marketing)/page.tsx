'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Serif, Eyebrow, Icon } from '@/components/ui';
import { Reveal, Counter, Marquee, WordRotate } from '@/components/motion';
import { useT, subjectName } from '@/components/i18n';
import { NavCard, FeatureCard, StepCard, HeroPreview } from './_components';

const navCards = [
  { icon: 'rocket_launch', label: 'Vstúpiť do databázy', desc: 'Prihlás sa a začni študovať — okruhy, materiály, testy a plán na jednom mieste.', cta: 'Prihlásiť sa', href: '/login', highlight: true },
  { icon: 'school', label: 'Predmety', desc: 'Všetky maturitné predmety s okruhmi, materiálmi a cvičnými testami.', cta: 'Zobraziť predmety', href: '/predmety' },
  { icon: 'library_books', label: 'Zdroje', desc: 'Externé materiály, videá a odporúčané zdroje na prípravu.', cta: 'Prehľadať zdroje', href: '/zdroje' },
  { icon: 'calendar_month', label: 'Rozvrh', desc: 'Týždenný plán štúdia s prehľadom termínov a skúšok.', cta: 'Otvoriť rozvrh', href: '/rozvrh' },
];

const features = [
  { icon: 'category', title: 'Okruhy podľa šablón', desc: 'Definície, vzorce, časové osi, slovíčka či eseje — každý okruh má vlastnú štruktúru.' },
  { icon: 'upload_file', title: 'Materiály a súbory', desc: 'Nahrávaj a organizuj poznámky, PDF a obrázky priamo pod jednotlivé okruhy.' },
  { icon: 'edit_note', title: 'Poznámky s autosave', desc: 'Píš poznámky s automatickým ukladaním, štítkami, konceptami a archívom.' },
  { icon: 'quiz', title: 'Cvičné testy', desc: 'Interaktívne kvízy s okamžitým vyhodnotením a uložením výsledkov.' },
  { icon: 'trending_up', title: 'Sledovanie pokroku', desc: 'Prehľad, koľko ti z každého predmetu ešte zostáva do maturity.' },
  { icon: 'co_present', title: 'Trieda s učiteľom', desc: 'Pripoj sa k učiteľovi kódom — vidí tvoj pokrok a posúva ťa ďalej.' },
];

const steps = [
  { icon: 'checklist', title: 'Vyber si predmety', desc: 'Označ, čo maturuješ. Pripni si najdôležitejšie predmety do bočného menu.' },
  { icon: 'folder_open', title: 'Organizuj okruhy', desc: 'Vytvor okruhy podľa šablón a nahraj k nim svoje materiály a poznámky.' },
  { icon: 'insights', title: 'Testuj sa a sleduj pokrok', desc: 'Precvičuj cvičné testy a sleduj, ako rastie tvoja pripravenosť.' },
];

const FALLBACK_SUBJECTS = [
  { name_sk: 'Matematika', icon: 'calculate' }, { name_sk: 'Slovenský jazyk', icon: 'history_edu' },
  { name_sk: 'Anglický jazyk', icon: 'language' }, { name_sk: 'Dejepis', icon: 'public' },
  { name_sk: 'Biológia', icon: 'science' }, { name_sk: 'Chémia', icon: 'biotech' },
  { name_sk: 'Fyzika', icon: 'bolt' }, { name_sk: 'Informatika', icon: 'computer' },
];

export default function HubPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const { t, lang } = useT();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const marqueeSubjects = subjects.length ? subjects : FALLBACK_SUBJECTS;
  const stats = [
    { value: subjects.length || 7, label: 'Maturitných predmetov', icon: 'menu_book' },
    { value: 7, label: 'Typov okruhov', icon: 'category' },
    { value: 100, suffix: '%', label: 'Zdarma pre študentov', icon: 'volunteer_activism' },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center', paddingTop: 'clamp(40px, 6vw, 80px)', paddingBottom: 56 }} className="mkb-herogrid">
        <div className="mkb-fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', padding: '7px 14px', borderRadius: 9999, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
            <span className="mkb-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
            {t('Všetko pre tvoju maturitu na jednom mieste')}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 22 }}>
            {t('Tvoja cesta k úspešnej')}{' '}
            <span className="mkb-underline-accent" style={{ color: 'var(--primary)' }}>{t('maturite')}</span>{' '}
            {t('začína tu.')}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--on-surface-variant)', marginBottom: 22, maxWidth: 520 }}>
            {t('Organizuj si okruhy, materiály a poznámky, precvičuj cvičné testy a sleduj svoj pokrok — prehľadne, moderne a efektívne.')}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '7px 14px', borderRadius: 9999, background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', fontSize: 13.5, fontWeight: 600 }}>
            <Icon name="auto_awesome" size={16} fill={1} style={{ color: 'var(--primary)' }} />
            {t('Pripravíme ťa na')}{' '}
            <WordRotate words={lang === 'en' ? ['Maths', 'Slovak', 'English', 'History', 'Biology', 'IT'] : ['Matematiku', 'Slovenčinu', 'Angličtinu', 'Dejepis', 'Biológiu', 'Informatiku']} style={{ fontWeight: 700, color: 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login"><Button size="lg" iconAfter="arrow_forward">{t('Vstúpiť do databázy')}</Button></Link>
            <Link href="/predmety"><Button size="lg" variant="secondary">{t('Preskúmať predmety')}</Button></Link>
          </div>
        </div>
        <div className="mkb-fade-up mkb-hide-mobile" style={{ animationDelay: '.12s' }}>
          <HeroPreview />
        </div>
      </section>

      {/* ── Subject marquee ──────────────────────────────── */}
      <Reveal style={{ marginBottom: 72 }}>
        <div style={{ border: '1px solid var(--outline-variant)', borderRadius: 16, background: 'var(--surface-container-lowest)', padding: '16px 0' }}>
          <Marquee duration={38}>
            {marqueeSubjects.map((s: any, i: number) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 16px', borderRadius: 9999, border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', whiteSpace: 'nowrap' }}>
                <Icon name={s.icon} size={19} fill={1} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{subjectName(s, lang)}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </Reveal>

      {/* ── Stats strip ──────────────────────────────────── */}
      <Reveal as="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 84 } as any} className="mkb-statgrid">
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={s.icon} size={24} fill={1} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: '-.02em' }}>
                <Counter value={s.value} suffix={s.suffix || ''} />
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>{t(s.label)}</div>
            </div>
          </div>
        ))}
      </Reveal>

      {/* ── Navigation cards ─────────────────────────────── */}
      <section style={{ marginBottom: 92 }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>{t('Preskúmaj')}</Eyebrow>
          <Serif size={38} weight={600} style={{ display: 'block', marginTop: 12 }}>{t('Kam ďalej?')}</Serif>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          {navCards.map((s, i) => <Reveal key={s.href} delay={i * 80}><NavCard {...s} /></Reveal>)}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ marginBottom: 92 }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 36, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          <Eyebrow>{t('Čo tu nájdeš')}</Eyebrow>
          <Serif size={38} weight={600} style={{ display: 'block', margin: '12px 0 12px' }}>{t('Všetko, čo na maturitu potrebuješ')}</Serif>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            {t('Nástroje navrhnuté tak, aby si sa mohol sústrediť na učenie — nie na organizovanie chaosu v priečinkoch.')}
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {features.map((f, i) => <Reveal key={f.title} delay={(i % 3) * 80}><FeatureCard {...f} /></Reveal>)}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section style={{ marginBottom: 92 }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>{t('Ako to funguje')}</Eyebrow>
          <Serif size={38} weight={600} style={{ display: 'block', marginTop: 12 }}>{t('Tri kroky k pripravenosti')}</Serif>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {steps.map((s, i) => <Reveal key={s.title} delay={i * 100}><StepCard num={i + 1} {...s} /></Reveal>)}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────── */}
      <Reveal as="section" style={{ marginBottom: 92 } as any}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 'clamp(40px, 5vw, 72px)', background: 'var(--panel-ink)', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--panel-ink-line) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .5 }} />
          <div style={{ position: 'relative' }}>
            <span className="mkb-eyebrow" style={{ color: 'var(--panel-ink-variant)' }}>{t('Začni ešte dnes')}</span>
            <Serif size={40} weight={700} style={{ display: 'block', color: '#fff', margin: '16px 0 14px', fontSize: 'clamp(30px, 4vw, 46px)' }}>
              {t('Pripravený začať?')}
            </Serif>
            <p style={{ fontSize: 17, color: 'var(--panel-ink-variant)', maxWidth: 520, margin: '0 auto 30px', lineHeight: 1.6 }}>
              {t('Prihlás sa, vyber si predmety a maj celú prípravu na maturitu pod kontrolou.')}
            </p>
            <Link href="/login"><Button size="lg" variant="white" iconAfter="arrow_forward">{t('Prihlásiť sa')}</Button></Link>
          </div>
        </div>
      </Reveal>

      <style>{`@media (max-width: 900px){ .mkb-herogrid{ grid-template-columns:1fr !important; gap:32px !important; } .mkb-statgrid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
