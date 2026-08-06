'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Serif, Eyebrow, Icon } from '@/components/ui';
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
  { icon: 'dark_mode', title: 'Svetlý aj tmavý režim', desc: 'Vyber si vzhľad, ktorý ti sedí — plus alternatívna farebná téma.' },
];

const steps = [
  { icon: 'checklist', title: 'Vyber si predmety', desc: 'Označ, čo maturuješ. Pripni si najdôležitejšie predmety do bočného menu.' },
  { icon: 'folder_open', title: 'Organizuj okruhy', desc: 'Vytvor okruhy podľa šablón a nahraj k nim svoje materiály a poznámky.' },
  { icon: 'insights', title: 'Testuj sa a sleduj pokrok', desc: 'Precvičuj cvičné testy a sleduj, ako rastie tvoja pripravenosť.' },
];

export default function HubPage() {
  const [subjectCount, setSubjectCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjectCount(Array.isArray(d) ? d.length : null)).catch(() => {});
  }, []);

  const stats = [
    { value: subjectCount != null ? String(subjectCount) : '—', label: 'Maturitných predmetov', icon: 'menu_book' },
    { value: '7', label: 'Typov okruhov', icon: 'category' },
    { value: '100%', label: 'Zdarma pre študentov', icon: 'volunteer_activism' },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 48, alignItems: 'center', paddingTop: 'clamp(40px, 6vw, 80px)', paddingBottom: 64 }} className="mkb-herogrid">
        <div className="mkb-fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', padding: '7px 14px', borderRadius: 9999, marginBottom: 24, fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
            Všetko pre tvoju maturitu na jednom mieste
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05, letterSpacing: '-.025em', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 22 }}>
            Tvoja cesta k úspešnej{' '}
            <span className="mkb-underline-accent" style={{ color: 'var(--primary)' }}>maturite</span>{' '}
            začína tu.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--on-surface-variant)', marginBottom: 32, maxWidth: 520 }}>
            Organizuj si okruhy, materiály a poznámky, precvičuj cvičné testy a sleduj svoj pokrok — prehľadne, moderne a efektívne.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login"><Button size="lg" iconAfter="arrow_forward">Vstúpiť do databázy</Button></Link>
            <Link href="/predmety"><Button size="lg" variant="secondary">Preskúmať predmety</Button></Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 13.5, color: 'var(--on-surface-variant)' }}>
            <Icon name="lock" size={16} fill={1} style={{ color: 'var(--success)' }} />
            Bezpečné prihlásenie · žiadne reklamy
          </div>
        </div>
        <div className="mkb-fade-up mkb-hide-mobile" style={{ animationDelay: '.12s' }}>
          <HeroPreview />
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 80 }} className="mkb-statgrid">
        {stats.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 18, padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={s.icon} size={24} fill={1} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Navigation cards ─────────────────────────────── */}
      <section style={{ marginBottom: 88 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>Preskúmaj</Eyebrow>
          <Serif size={38} weight={700} style={{ display: 'block', marginTop: 10 }}>Kam ďalej?</Serif>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          {navCards.map(s => <NavCard key={s.href} {...s} />)}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ marginBottom: 88 }}>
        <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          <Eyebrow>Čo tu nájdeš</Eyebrow>
          <Serif size={38} weight={700} style={{ display: 'block', margin: '10px 0 12px' }}>Všetko, čo na maturitu potrebuješ</Serif>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            Nástroje navrhnuté tak, aby si sa mohol sústrediť na učenie — nie na organizovanie chaosu v priečinkoch.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section style={{ marginBottom: 88 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>Ako to funguje</Eyebrow>
          <Serif size={38} weight={700} style={{ display: 'block', marginTop: 10 }}>Tri kroky k pripravenosti</Serif>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {steps.map((s, i) => <StepCard key={s.title} num={i + 1} {...s} />)}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────── */}
      <section style={{ marginBottom: 88 }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 'clamp(40px, 5vw, 72px)', background: 'var(--panel-ink)', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--panel-ink-line) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .5 }} />
          <div style={{ position: 'relative' }}>
            <span className="mkb-eyebrow" style={{ color: 'var(--panel-ink-variant)' }}>Začni ešte dnes</span>
            <Serif size={40} weight={700} style={{ display: 'block', color: '#fff', margin: '16px 0 14px', fontSize: 'clamp(30px, 4vw, 46px)' }}>
              Pripravený začať?
            </Serif>
            <p style={{ fontSize: 17, color: 'var(--panel-ink-variant)', maxWidth: 520, margin: '0 auto 30px', lineHeight: 1.6 }}>
              Prihlás sa, vyber si predmety a maj celú prípravu na maturitu pod kontrolou.
            </p>
            <Link href="/login"><Button size="lg" variant="white" iconAfter="arrow_forward">Prihlásiť sa</Button></Link>
          </div>
        </div>
      </section>

      <style>{`@media (max-width: 900px){ .mkb-herogrid{ grid-template-columns:1fr !important; gap:32px !important; } .mkb-statgrid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
