'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Icon, Button, Card, Serif, Eyebrow, Input, EmptyState } from '@/components/ui';
import { useToastCtx } from '../layout';

const faqs = [
  { cat: 'Účet', q: 'Ako si zmením heslo?', a: 'Choď do Nastavenia → Profil, zadaj nové heslo do poľa „Nové heslo" a ulož zmeny.' },
  { cat: 'Predmety', q: 'Ako pripnem predmet do bočného menu?', a: 'Na stránke Predmety klikni na ikonu špendlíka pri predmete. Pripnuté predmety sa okamžite zobrazia v ľavom menu.' },
  { cat: 'Trieda', q: 'Ako sa pripojím k učiteľovi?', a: 'Učiteľ ti dá pozývací kód. Zadaj ho v Nastavenia → Trieda a klikni „Pripojiť sa". Učiteľ potom uvidí tvoj pokrok.' },
  { cat: 'Štúdium', q: 'Ako funguje študijná session?', a: 'V bočnom menu klikni na „Spustiť session", vyber dĺžku (15/25/50 min) a prípadne predmet. Po dokončení sa session zaznamená do tvojho pokroku.' },
  { cat: 'Pokrok', q: 'Prečo sa mi neaktualizuje pokrok?', a: 'Pokrok rastie po dokončení testov a študijných sessions. Skontroluj, či máš predmet pridaný v pláne.' },
  { cat: 'Testy', q: 'Kde nájdem svoje výsledky testov?', a: 'Všetky výsledky sú v sekcii Môj pokrok, spolu s odznakmi a prehľadom predmetov.' },
  { cat: 'Účet', q: 'Môžem meniť predmety neskôr?', a: 'Áno, kedykoľvek v Nastavenia → Moje predmety. Zmeny sa prejavia okamžite.' },
  { cat: 'Vzhľad', q: 'Ako zapnem tmavý režim?', a: 'Klikni na ikonu 🌙 v hlavičke, alebo detailne v Nastavenia → Vzhľad (svetlý / tmavý / podľa systému).' },
];

const guides = [
  { icon: 'school', title: 'Vyber si predmety', href: '/subjects' },
  { icon: 'menu_book', title: 'Prehľadaj materiály', href: '/materials' },
  { icon: 'quiz', title: 'Sprav si cvičný test', href: '/tests' },
  { icon: 'settings', title: 'Nastav si účet', href: '/settings' },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Všeobecné');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const { flash } = useToastCtx();

  const filtered = faqs.filter(f => !q || f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()) || f.cat.toLowerCase().includes(q.toLowerCase()));

  const scrollToForm = (prefill?: string) => {
    if (prefill) setSubject(prefill);
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
  };

  const send = () => {
    if (!subject.trim() || !msg.trim()) { flash('Vyplň predmet aj správu'); return; }
    setSent(true);
    flash('Správa odoslaná! Odpovieme do 24 hodín.');
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <header style={{ marginBottom: 28 }}>
        <Eyebrow icon="help">Centrum pomoci</Eyebrow>
        <Serif size={52} weight={700} style={{ display: 'block', margin: '10px 0', fontSize: 'clamp(30px, 6vw, 48px)' }}>Podpora</Serif>
        <div style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>Rýchli sprievodcovia, časté otázky a priamy kontakt.</div>
      </header>

      {/* Quick actions */}
      <div className="mkb-statgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { icon: 'menu_book', label: 'Sprievodcovia', sub: 'Nauč sa portál za 2 minúty.', onClick: () => document.getElementById('sprievodcovia')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: 'forum', label: 'Napíš nám', sub: 'Pošli správu podpore.', onClick: () => scrollToForm() },
          { icon: 'bug_report', label: 'Nahlásiť chybu', sub: 'Niečo nefunguje?', onClick: () => scrollToForm('[Chyba] ') },
        ].map(a => (
          <Card key={a.label} hover onClick={a.onClick} style={{ cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name={a.icon} size={23} fill={1} />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 3 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{a.sub}</div>
          </Card>
        ))}
      </div>

      {/* Guides */}
      <div id="sprievodcovia" style={{ marginBottom: 32 }}>
        <Serif size={20} weight={600} style={{ display: 'block', marginBottom: 14 }}>Rýchli sprievodcovia</Serif>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {guides.map(g => (
            <Link key={g.href} href={g.href}>
              <Card hover style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-container-high)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={g.icon} size={20} fill={1} /></div>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{g.title}</span>
                <Icon name="arrow_forward" size={17} style={{ color: 'var(--on-surface-variant)' }} />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <Serif size={20} weight={600}>Časté otázky</Serif>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <Icon name="search" size={18} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Hľadať v otázkach…"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 14, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '9px 14px 9px 40px', color: 'var(--on-surface)', outline: 'none', width: '100%' }} />
          </div>
        </div>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <EmptyState icon="search_off" title="Nič sa nenašlo" desc="Skús iný výraz alebo nám napíš priamo." action={<Button icon="forum" onClick={() => scrollToForm()}>Napíš nám</Button>} />
          ) : filtered.map((f, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '16px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mkb-mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--primary)', border: '1px solid var(--outline-variant)', borderRadius: 6, padding: '2px 7px' }}>{f.cat}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{f.q}</span>
                </span>
                <Icon name={open === i ? 'remove' : 'add'} size={20} style={{ color: 'var(--on-surface-variant)', flex: 'none' }} />
              </button>
              {open === i && <div style={{ padding: '0 22px 18px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--on-surface-variant)' }}>{f.a}</div>}
            </div>
          ))}
        </Card>
      </div>

      {/* Contact */}
      <Card pad={24} id="kontakt">
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--success-container)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Icon name="mark_email_read" size={30} fill={1} /></div>
            <Serif size={22} weight={600} style={{ display: 'block', marginBottom: 6 }}>Správa odoslaná!</Serif>
            <div style={{ fontSize: 14.5, color: 'var(--on-surface-variant)', marginBottom: 18 }}>Ďakujeme. Ozveme sa ti na e-mail do 24 hodín.</div>
            <Button variant="secondary" icon="reply" onClick={() => { setSent(false); setSubject(''); setMsg(''); }}>Poslať ďalšiu</Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
              <Serif size={20} weight={600}>Stále potrebuješ pomoc?</Serif>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--success)' }}>
                <span className="mkb-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> Podpora online
              </span>
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--on-surface-variant)', marginBottom: 20 }}>Napíš nám a odpovieme do jedného pracovného dňa.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 7 }}>Kategória</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Všeobecné', 'Účet', 'Technický problém', 'Návrh'].map(c => (
                    <button key={c} onClick={() => setCat(c)} style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 9999, padding: '7px 14px', border: `1px solid ${cat === c ? 'var(--primary)' : 'var(--outline-variant)'}`, background: cat === c ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)', color: cat === c ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)' }}>{c}</button>
                  ))}
                </div>
              </div>
              <Input label="Predmet" placeholder="Stručne opíš problém" value={subject} onChange={e => setSubject(e.target.value)} icon="subject" />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Správa</span>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Poskytni čo najviac detailov…"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: 15, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', padding: '12px 14px', color: 'var(--on-surface)', outline: 'none', resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--ring)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--outline-variant)'; e.target.style.boxShadow = 'none'; }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="mail" size={16} /> podpora@maturitakb.sk</span>
                <Button onClick={send} icon="send">Odoslať správu</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
