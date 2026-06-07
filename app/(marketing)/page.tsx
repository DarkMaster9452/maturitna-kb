'use client';
import Link from 'next/link';
import { Button, Serif, Eyebrow } from '@/components/ui';
import { SectionCard } from './_components';

const sectionCards = [
  { icon: 'rocket_launch', label: 'Vstúpiť do databázy', desc: 'Prihlás sa a začni študovať — okruhy, testy a plán na jednom mieste.', cta: 'Prihlásiť sa', href: '/login', highlight: true },
  { icon: 'library_books', label: 'Zdroje', desc: 'Externé materiály, videá a odporúčané zdroje na prípravu na maturitu.', cta: 'Prehľadať zdroje', href: '/zdroje' },
  { icon: 'school', label: 'Predmety', desc: 'Všetky maturitné predmety s materiálmi, okruhmi a cvičnými testami.', cta: 'Zobraziť predmety', href: '/predmety' },
  { icon: 'calendar_month', label: 'Rozvrh', desc: 'Týždenný plán štúdia optimalizovaný na maturitu s prehľadom termínov.', cta: 'Otvoriť rozvrh', href: '/rozvrh' },
];

export default function HubPage() {
  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: 768, margin: '0 auto', paddingTop: 72, paddingBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(197,195,232,.35)', color: 'var(--on-surface-variant)', padding: '7px 16px', borderRadius: 9999, marginBottom: 32, fontSize: 12, fontWeight: 500 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          Všetko pre vašu maturitu na jednom mieste
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 7vw, 56px)', lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 24 }}>
          Vaša cesta k úspešnej <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>maturite</span> začína tu.
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)', marginBottom: 40, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Organizované materiály, testy a študijné zdroje pre všetky maturitné predmety. Prehľadne, moderne a efektívne.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/login"><Button iconAfter="chevron_right">Vstúpiť do databázy</Button></Link>
          <Link href="/predmety"><Button variant="secondary">Viac informácií</Button></Link>
        </div>
      </div>

      <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: '32px 24px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        {[['Tvoje predmety', 'Vyber si, čo maturuješ'], ['Okruhy a súbory', 'Nahraj a organizuj materiály'], ['Tvoj pokrok', 'Sleduj, čo ti zostáva']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <Serif size={24} weight={700} style={{ display: 'block', color: 'var(--primary)' }}>{v}</Serif>
            <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Eyebrow>Čo tu nájdeš</Eyebrow>
          <Serif size={36} weight={700} style={{ display: 'block', marginTop: 10, letterSpacing: '-.02em' }}>Preskúmaj platformu</Serif>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {sectionCards.map(s => <SectionCard key={s.href} {...s} />)}
        </div>
      </div>
    </div>
  );
}
