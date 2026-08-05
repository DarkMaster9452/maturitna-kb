'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Icon, Serif } from '@/components/ui';

/* Navigation card (links to a section) */
export function NavCard({ icon, label, desc, cta, href, highlight }: {
  icon: string; label: string; desc: string; cta: string; href: string; highlight?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <Link href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: highlight ? undefined : 'var(--surface-container-lowest)',
        backgroundImage: highlight ? 'var(--grad-brand-vivid)' : undefined,
        border: `1px solid ${highlight ? 'transparent' : 'var(--outline-variant)'}`,
        borderRadius: 20, padding: 26, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        boxShadow: h ? (highlight ? '0 22px 48px -18px color-mix(in srgb, var(--primary) 70%, transparent)' : 'var(--shadow-card-hover)') : (highlight ? '0 12px 30px -14px color-mix(in srgb, var(--primary) 55%, transparent)' : 'var(--shadow-card)'),
        transform: h ? 'translateY(-4px)' : 'none', transition: 'all .28s cubic-bezier(.16,.84,.44,1)',
      }}>
      <div style={{
        width: 52, height: 52, borderRadius: 15,
        background: highlight ? 'rgba(255,255,255,.18)' : 'var(--primary-fixed)',
        color: highlight ? '#fff' : 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}><Icon name={icon} size={26} fill={1} /></div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, color: highlight ? '#fff' : 'var(--on-surface)', marginBottom: 10, lineHeight: 1.25, letterSpacing: '-.01em' }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: highlight ? 'rgba(255,255,255,.85)' : 'var(--on-surface-variant)', flex: 1, marginBottom: 20 }}>{desc}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: highlight ? '#fff' : 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {cta} <Icon name="arrow_forward" size={16} style={{ transform: h ? 'translateX(3px)' : 'none', transition: 'transform .2s' }} />
      </div>
    </Link>
  );
}

/* Feature card (no link) */
export function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 18, padding: 24, transition: 'all .28s', transform: h ? 'translateY(-3px)' : 'none', boxShadow: h ? 'var(--shadow-card-hover)' : 'var(--shadow-card)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon name={icon} size={24} fill={1} />
      </div>
      <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 7 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--on-surface-variant)' }}>{desc}</div>
    </div>
  );
}

/* Step card ("how it works") */
export function StepCard({ num, icon, title, desc }: { num: number; icon: string; title: string; desc: string }) {
  return (
    <div style={{ position: 'relative', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 18, padding: '28px 24px', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ position: 'absolute', top: 20, right: 22, fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 700, lineHeight: 1, color: 'var(--outline-variant)' }}>{num}</div>
      <div style={{ width: 50, height: 50, borderRadius: 15, backgroundImage: 'var(--grad-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 8px 20px -8px color-mix(in srgb, var(--primary) 60%, transparent)' }}>
        <Icon name={icon} size={24} fill={1} />
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>{desc}</div>
    </div>
  );
}

export function BackLink({ label = 'Späť na úvod' }: { label?: string }) {
  const [h, setH] = useState(false);
  return (
    <Link href="/" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
      fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)', padding: '6px 0', marginBottom: 24,
    }}>
      <Icon name="arrow_back" size={18} style={{ transform: h ? 'translateX(-3px)' : 'none', transition: 'transform .2s' }} /> {label}
    </Link>
  );
}

/* Stylised product preview used in the hero */
export function HeroPreview() {
  const rows = [
    { icon: 'calculate', name: 'Matematika', pct: 78 },
    { icon: 'history_edu', name: 'Slovenský jazyk', pct: 54 },
  ];
  return (
    <div style={{ position: 'relative' }}>
      {/* floating chips */}
      <div className="mkb-float mkb-hide-mobile" style={{ position: 'absolute', top: -18, left: -18, zIndex: 3, background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 14, padding: '10px 14px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--success-container)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="task_alt" size={20} fill={1} /></div>
        <div><div style={{ fontSize: 12, fontWeight: 700 }}>Test dokončený</div><div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Skóre 92 %</div></div>
      </div>
      <div className="mkb-float mkb-hide-mobile" style={{ position: 'absolute', bottom: 24, right: -22, zIndex: 3, animationDelay: '1.5s', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 14, padding: '10px 14px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="local_fire_department" size={20} fill={1} /></div>
        <div><div style={{ fontSize: 12, fontWeight: 700 }}>7 dní v rade</div><div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Séria štúdia</div></div>
      </div>

      <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--outline-variant)', boxShadow: 'var(--shadow-lg)', background: 'var(--surface-container-lowest)' }}>
        {/* window bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
          <span style={{ width: 11, height: 11, borderRadius: 9999, background: '#ff5f57' }} />
          <span style={{ width: 11, height: 11, borderRadius: 9999, background: '#febc2e' }} />
          <span style={{ width: 11, height: 11, borderRadius: 9999, background: '#28c840' }} />
          <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>maturitakb · dashboard</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', minHeight: 300 }}>
          {/* mini sidebar */}
          <div style={{ borderRight: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, backgroundImage: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}><Icon name="school" size={18} fill={1} style={{ color: '#fff' }} /></div>
            {['dashboard', 'menu_book', 'edit_note', 'quiz', 'trending_up'].map((ic, i) => (
              <div key={ic} style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? 'var(--primary-fixed)' : 'transparent', color: i === 0 ? 'var(--primary)' : 'var(--on-surface-variant)' }}><Icon name={ic} size={19} fill={i === 0 ? 1 : 0} /></div>
            ))}
          </div>
          {/* content */}
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' }}>Vitaj späť</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: '4px 0 16px' }}>Tvoj prehľad</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[['Predmety', '5'], ['Okruhy', '23'], ['Priemer', '71%']].map(([l, v]) => (
                <div key={l} style={{ flex: 1, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--on-surface-variant)', fontWeight: 600 }}>{l}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rows.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={r.icon} size={19} fill={1} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{r.name}</div>
                    <div style={{ height: 6, borderRadius: 9999, background: 'var(--surface-container-high)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: r.pct + '%', backgroundImage: 'var(--grad-brand)', borderRadius: 9999 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
