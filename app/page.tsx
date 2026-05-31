'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon, Button, Card, IconChip, Progress, Chip, Serif, Eyebrow, Logo } from '@/components/ui';

type Subject = { id: string; slug: string; name_sk: string; name_en: string; icon: string; description_sk: string; sort_order: number };

export default function LandingPage() {
  const [tab, setTab] = useState<'hub' | 'resources' | 'subjects' | 'schedule'>('hub');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(setSubjects).catch(() => {});
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [
    { id: 'hub', label: 'Študijný hub' },
    { id: 'resources', label: 'Zdroje' },
    { id: 'subjects', label: 'Predmety' },
    { id: 'schedule', label: 'Rozvrh' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(252,249,245,.95)' : 'var(--surface)', backdropFilter: 'blur(12px)', padding: '14px 48px', borderBottom: `1px solid ${scrolled ? 'var(--outline-variant)' : 'transparent'}`, transition: 'all .3s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {navLinks.map(l => (
              <button key={l.id} onClick={() => setTab(l.id)}
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, letterSpacing: '.04em', background: 'none', border: 'none', cursor: 'pointer', color: tab === l.id ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === l.id ? '2px solid var(--primary)' : '2px solid transparent', paddingBottom: 2, transition: 'color .2s' }}>
                {l.label}
              </button>
            ))}
          </div>
          <Link href="/login">
            <Button>Prihlásenie študenta</Button>
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, background: 'radial-gradient(circle at 50% 0%,#fffcf5 0%,#f8f5f0 100%)', padding: '0 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {tab === 'hub' && <HubTab onEnter={() => router.push('/login')} />}
          {tab === 'resources' && <ResourcesTab />}
          {tab === 'subjects' && <SubjectsTab subjects={subjects} onEnter={() => router.push('/login')} />}
          {tab === 'schedule' && <ScheduleTab />}
        </div>
      </main>

      <footer style={{ background: 'var(--surface-container)', padding: '32px 48px', borderTop: '1px solid var(--outline-variant)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Logo />
          <div style={{ display: 'flex', gap: 24 }}>
            {['Ochrana súkromia', 'Podmienky', 'Kontakt', 'Mapa stránky'].map(f => (
              <span key={f} style={{ fontSize: 12, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>{f}</span>
            ))}
          </div>
          <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>© 2024 Maturita Knowledge Base</div>
        </div>
      </footer>
    </div>
  );
}

function HubTab({ onEnter }: { onEnter: () => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: 768, margin: '0 auto', paddingTop: 72, paddingBottom: 80 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(215,195,182,.3)', color: 'var(--on-surface-variant)', padding: '7px 16px', borderRadius: 9999, marginBottom: 32, fontSize: 12, fontWeight: 500 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> Všetko pre vašu maturitu na jednom mieste
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1.1, letterSpacing: '-.02em', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 24 }}>
          Vaša cesta k úspešnej <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>maturite</span> začína tu.
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)', marginBottom: 40, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Organizované materiály, testy a študijné zdroje pre všetky maturitné predmety. Prehľadne, moderne a efektívne.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Button onClick={onEnter} iconAfter="chevron_right">Vstúpiť do databázy</Button>
          <Button variant="secondary">Viac informácií</Button>
        </div>
      </div>
      <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 16, padding: '32px 48px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {[['14 000+', 'Aktívnych študentov'], ['10 predmetov', 'Pokrytých predmetov'], ['98%', 'Úspešnosť maturity']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <Serif size={40} weight={700} style={{ display: 'block', color: 'var(--primary)' }}>{v}</Serif>
            <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, paddingBottom: 80 }}>
        {[['menu_book', 'Prehľadné okruhy', 'Všetky maturitné otázky spracované v logických celkoch.'], ['auto_stories', 'Kvalitné materiály', 'Preverené poznámky, videá a externé zdroje pre hlbšie štúdium.'], ['import_contacts', 'Študijný plán', 'Sledujte svoj pokrok a majte prehľad o tom, čo vám zostáva.']].map(([icon, title, body]) => (
          <Card key={title as string} hover pad={32} radius={12}>
            <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'rgba(215,195,182,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 24 }}>
              <Icon name={icon as string} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>{title}</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.5, color: 'var(--on-surface-variant)' }}>{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResourcesTab() {
  const [resources, setResources] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(setResources).catch(() => {});
    fetch('/api/subjects').then(r => r.json()).then(setSubjects).catch(() => {});
  }, []);

  const typeColor: Record<string, any> = {
    PDF: { bg: 'var(--primary-fixed)', c: 'var(--primary)' },
    Video: { bg: '#dcedf5', c: '#1a6b8a' },
    Web: { bg: 'var(--tertiary-fixed)', c: 'var(--tertiary)' },
    Audio: { bg: 'var(--secondary-container)', c: 'var(--secondary)' },
  };

  const shown = filter === 'all' ? resources : resources.filter(r => r.subject_id === filter);

  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Externé zdroje</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Zdroje</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Externé materiály a odporúčané zdroje pre prípravu na maturitu.</div>
      </header>
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === 'all' ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === 'all' ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === 'all' ? 'var(--primary)' : 'var(--outline-variant)'}` }}>Všetky</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 16px', background: filter === s.id ? 'var(--primary)' : 'var(--surface-container-lowest)', color: filter === s.id ? '#fff' : 'var(--on-surface-variant)', border: `1px solid ${filter === s.id ? 'var(--primary)' : 'var(--outline-variant)'}` }}>{s.name_sk}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {shown.map((r: any) => (
          <Card key={r.id} hover pad={20} radius={12} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: typeColor[r.type]?.bg || 'var(--primary-fixed)', color: typeColor[r.type]?.c || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={r.icon} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                <Chip tone="subject">{r.type}</Chip>
                {r.badge && <Chip tone="trend">{r.badge}</Chip>}
              </div>
              <Serif size={17} weight={600} style={{ display: 'block', marginBottom: 6 }}>{r.title}</Serif>
              <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{r.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SubjectsTab({ subjects, onEnter }: { subjects: Subject[]; onEnter: () => void }) {
  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <header style={{ marginBottom: 40 }}>
        <Eyebrow>Predmety maturity</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Predmety</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Všetky maturitné predmety s materiálmi a cvičnými testami.</div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {subjects.map(s => (
          <Card key={s.id} hover pad={24} radius={12} onClick={onEnter} style={{ cursor: 'pointer' }}>
            <IconChip name={s.icon} size={48} radius={12} />
            <Serif size={20} weight={600} style={{ display: 'block', margin: '16px 0 8px' }}>{s.name_sk}</Serif>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{s.description_sk}</div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Zobraziť materiály →</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const sessions = [
    { day: 'Pondelok', time: '08:00', dur: 90, subj: 'Matematika', topic: 'Integrálny počet – opakovanie', icon: 'calculate', color: 'var(--primary-fixed)', border: 'var(--primary)' },
    { day: 'Pondelok', time: '14:00', dur: 60, subj: 'Anglický jazyk', topic: 'Writing – esej', icon: 'language', color: '#dcedf5', border: '#1a6b8a' },
    { day: 'Utorok', time: '09:00', dur: 120, subj: 'Slovenský jazyk', topic: 'Národné obrodenie – opakovanie', icon: 'history_edu', color: 'var(--tertiary-fixed)', border: 'var(--tertiary)' },
    { day: 'Streda', time: '10:00', dur: 90, subj: 'Matematika', topic: 'Cvičný test – derivácie', icon: 'quiz', color: 'var(--primary-fixed)', border: 'var(--primary)' },
    { day: 'Štvrtok', time: '08:30', dur: 60, subj: 'Dejepis', topic: 'Svetové vojny', icon: 'public', color: 'var(--secondary-container)', border: 'var(--secondary)' },
    { day: 'Piatok', time: '15:00', dur: 90, subj: 'Biológia', topic: 'Genetika – Mendelove zákony', icon: 'science', color: '#dcf0d4', border: 'var(--success)' },
  ];
  return (
    <div style={{ paddingTop: 48, paddingBottom: 80 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 40 }}>
        <div>
          <Eyebrow>Študijný rozvrh</Eyebrow>
          <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Rozvrh</Serif>
          <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Váš týždenný plán štúdia, optimalizovaný na maturitu.</div>
        </div>
        <Button icon="add">Pridať blok</Button>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <Card pad={24} radius={12}>
          <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 20 }}>Tento týždeň</Serif>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: s.color, borderLeft: `3px solid ${s.border}` }}>
                <Icon name={s.icon} size={20} style={{ color: s.border, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>{s.subj}</span>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{s.day} · {s.time} · {s.dur} min</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{s.topic}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card pad={24} radius={12}>
            <Serif size={18} weight={600} style={{ display: 'block', marginBottom: 16 }}>Nadchádzajúce skúšky</Serif>
            {[['12. 3.', 'Matematika', 'Ústna'], ['15. 3.', 'Slovenský jazyk', 'Písomná'], ['22. 3.', 'Anglický jazyk', 'Ústna']].map(([d, s, t]) => (
              <div key={d} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{d.split('.')[0]}</span>
                </div>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{s}</div><div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{t} skúška</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
