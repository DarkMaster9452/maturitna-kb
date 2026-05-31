'use client';
import { useState } from 'react';
import { Icon, Button, Card, IconChip, Serif, Eyebrow, Input } from '@/components/ui';
import { useToastCtx } from '../layout';

const faqs = [
  { q: 'Ako si resetujem heslo?', a: 'Choď do Nastavenia → Bezpečnosť → Zmeniť heslo. Ak si sa zamkol, použi odkaz "Zabudnuté heslo?" na prihlasovacej stránke.' },
  { q: 'Môžem si stiahnuť materiály na offline použitie?', a: 'Áno. Na každej karte materiálu klikni na ikonu stiahnutia (↓) a PDF sa stiahne do tvojho zariadenia.' },
  { q: 'Ako funguje pripnutie predmetu do sidebaru?', a: 'Na stránke Predmety klikni na ikonu špendlíka pri ľubovoľnom predmete. Pripnuté predmety sa okamžite zobrazia v ľavom menu.' },
  { q: 'Prečo sa môj pokrok neaktualizuje?', a: 'Pokrok sa aktualizuje po dokončení testu alebo prečítaní materiálu. Uisti sa, že si označil sekcie ako "hotové".' },
  { q: 'Ako nahlásim chybu v materiáli?', a: 'Otvor materiál, klikni na menu "⋯" vpravo hore a vyber "Nahlásiť problém". Naši redaktori preverujú hlásenia do 48 hodín.' },
  { q: 'Môžem meniť svoje maturitné predmety neskôr?', a: 'Áno, kedykoľvek. Choď do Nastavenia → Moje predmety a uprav výber. Zmeny sa prejavia okamžite.' },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const { flash } = useToastCtx();

  const send = () => {
    if (!subject || !msg) { flash('Vyplň predmet a správu'); return; }
    flash("Správa odoslaná! Odpovieme do 24 hodín.");
    setSubject(''); setMsg('');
  };

  return (
    <div style={{ maxWidth: 740 }}>
      <header style={{ marginBottom: 32 }}>
        <Eyebrow>Centrum pomoci</Eyebrow>
        <Serif size={52} weight={700} style={{ letterSpacing: '-.02em', display: 'block', margin: '8px 0' }}>Podpora</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Príručky, FAQ a priama podpora pre tvoj portál.</div>
      </header>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
        {[['article', 'Dokumentácia', 'Prehľadaj príručky a tutoriály.'], ['chat', 'Live chat', 'Porozprávaj sa s agentom.'], ['bug_report', 'Nahlásiť chybu', 'Niečo nefunguje? Daj nám vedieť.']].map(([icon, label, sub]) => (
          <Card key={label as string} hover pad={20} radius={12} onClick={() => flash(`Otvára sa ${label}…`)} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 12px', width: 44, height: 44, borderRadius: 10, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon as string} />
            </div>
            <Serif size={16} weight={600} style={{ display: 'block', marginBottom: 4 }}>{label}</Serif>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card pad={0} radius={12} style={{ marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)' }}>
          <Serif size={20} weight={600}>Často kladené otázky</Serif>
        </div>
        {faqs.map((f, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>{f.q}</span>
              <Icon name={open === i ? 'expand_less' : 'expand_more'} size={20} style={{ color: 'var(--on-surface-variant)', flex: 'none' }} />
            </button>
            {open === i && <div style={{ padding: '0 24px 20px', fontSize: 15, lineHeight: 1.7, color: 'var(--on-surface-variant)' }}>{f.a}</div>}
          </div>
        ))}
      </Card>

      {/* Contact form */}
      <Card pad={24} radius={12}>
        <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 6 }}>Stále potrebuješ pomoc?</Serif>
        <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 24 }}>Pošli nám správu a odpovieme do jedného pracovného dňa.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Predmet" placeholder="Stručne opíš problém" value={subject} onChange={e => setSubject(e.target.value)} icon="subject" />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', color: 'var(--on-surface-variant)' }}>Správa</span>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Poskytni čo najviac detailov…"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '12px 14px', color: 'var(--on-surface)', outline: 'none', resize: 'vertical', transition: 'border-color .2s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(132,79,34,.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
          </label>
          <Button onClick={send} icon="send" style={{ alignSelf: 'flex-start' }}>Odoslať správu</Button>
        </div>
      </Card>
    </div>
  );
}
